import type { EditorHost } from "@blocksuite/std";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { countWordsAndChars } from "@/services/editor/plainText";
import { TooltipProvider } from "../../../components/ui/tooltip";
import type { Note } from "../../../domain/note/Note";
import { cn } from "../../../lib/utils";
import { Logger } from "../../../services/Logger";
import { noteActions } from "../../../store/noteActions";
import { EditorHeader } from "../EditorHeader";
import { EditorRightBar } from "../EditorRightBar";
import { EditorTopbar } from "../EditorTopbar";
import { OutlineViewerHost } from "../OutlineViewerHost";
import { BlockSuiteSurface } from "./BlockSuiteSurface";
import { EditorErrorBoundary } from "./EditorErrorBoundary";

const RIGHTBAR_KEY = "cove-rightbar-open";

interface BlockSuiteNoteEditorProps {
  note: Note;
}

export const BlockSuiteNoteEditor: React.FC<BlockSuiteNoteEditorProps> = ({ note }) => {
  const updateNote = noteActions.updateNote;
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(document.fullscreenElement));
  const [isRightBarOpen, setRightBarOpen] = useState(
    () => localStorage.getItem(RIGHTBAR_KEY) === "true",
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editorHost, setEditorHost] = useState<EditorHost | null>(null);
  const mode = note.docMode ?? "page";
  // Page width is a persisted per-doc property.
  const isFullWidth = (note.pageWidth ?? "standard") === "fullWidth";
  const { wordCount, characterCount } = useMemo(
    () => countWordsAndChars(note.content),
    [note.content],
  );

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the scroll div unmounts/remounts when the doc mode flips, so the listener must re-attach — mode is load-bearing here
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    // The vendored kanban board scrolls its column strip horizontally but
    // never maps the vertical wheel to it — with a plain desktop mouse an
    // overflowing board is unscrollable. Capture runs before the board's own
    // wheel handler (which stops propagation) and converts deltaY to
    // scrollLeft only when the pointer is over a strip that can consume it.
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return; // pinch-zoom / app zoom
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const target = e.target instanceof Element ? e.target : null;
      const strip = target?.closest("affine-data-view-kanban-group")?.parentElement;
      if (!strip || strip.scrollWidth <= strip.clientWidth) return;
      // Only swallow the event while the strip can actually move — at either
      // end the doc must keep scrolling vertically.
      const next = strip.scrollLeft + e.deltaY;
      if (next < 0 || next > strip.scrollWidth - strip.clientWidth) return;
      strip.scrollLeft = next;
      e.preventDefault();
    };
    scroller.addEventListener("wheel", onWheel, { capture: true, passive: false });

    // Follow the caret the way AFFiNE does, replacing the vendored auto-scroll
    // we disabled: when a selection lands outside the visible band (Enter at
    // the bottom pushes the new line below the fold), scroll the MINIMUM
    // needed to reveal it. One-way and minimal by construction — it only ever
    // fires while the caret is out of view, so it cannot oscillate.
    const CARET_MARGIN = 24;
    const onSelectionChange = () => {
      const sel = document.getSelection();
      if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;
      const node = sel.anchorNode;
      const el = node?.nodeType === 1 ? (node as Element) : (node?.parentElement ?? null);
      if (!el || !scroller.contains(el)) return;
      // Measure after layout settles — Enter's new line renders async in Lit.
      requestAnimationFrame(() => {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        const view = scroller.getBoundingClientRect();
        if (rect.bottom > view.bottom - CARET_MARGIN) {
          scroller.scrollTop += rect.bottom - (view.bottom - CARET_MARGIN);
        } else if (rect.top < view.top + CARET_MARGIN) {
          scroller.scrollTop -= view.top + CARET_MARGIN - rect.top;
        }
      });
    };
    document.addEventListener("selectionchange", onSelectionChange);

    // Dev-only scroll tracer: "the screen scrolls by itself" reports get a
    // ring buffer of every scroll with the hovered element, readable from
    // the WebView2 profile's localStorage (cove-scroll-trace) to identify
    // the culprit without devtools. The dev server always serves from
    // localhost — installed builds never match. The API patch layer records
    // a stack for every programmatic scrollIntoView/scrollTo so the next
    // trace names the caller, not just the motion.
    let stopTrace = () => {};
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      const KEY = "cove-scroll-trace";
      const API_KEY = "cove-scroll-api";
      const ring: string[] = [];
      const apiRing: string[] = [];
      let lastTop = scroller.scrollTop;
      let lastWheelAt = 0;
      let hover = "";
      let lastHoverAt = 0;
      const describe = (el: Element | null): string => {
        if (!el) return "";
        const tag = el.tagName.toLowerCase();
        const cls = typeof el.className === "string" ? el.className.split(/\s+/)[0] : "";
        return cls ? `${tag}.${cls}` : tag;
      };
      const flush = () => {
        try {
          localStorage.setItem(KEY, JSON.stringify(ring));
          localStorage.setItem(API_KEY, JSON.stringify(apiRing));
        } catch {}
      };
      const onScroll = () => {
        const top = scroller.scrollTop;
        const dy = top - lastTop;
        lastTop = top;
        const sinceWheel = performance.now() - lastWheelAt;
        if (Math.abs(dy) < 1) return;
        ring.push(
          `${Math.round(performance.now())}ms top=${Math.round(top)} dy=${Math.round(dy)} sinceWheel=${Math.round(sinceWheel)}ms hover=${hover} hoverAge=${Math.round(performance.now() - lastHoverAt)}ms`,
        );
        if (ring.length > 120) ring.splice(0, ring.length - 120);
        flush();
      };
      const onWheelTrace = () => {
        lastWheelAt = performance.now();
      };
      const onPointerMove = (e: PointerEvent) => {
        hover = describe(e.target instanceof Element ? e.target : null);
        lastHoverAt = performance.now();
      };
      const inOurTree = (el: Element | null): boolean => {
        for (let cur: Element | null = el; cur; cur = cur.parentElement) {
          if (cur === scroller) return true;
        }
        return false;
      };
      const recordApi = (method: string, el: Element | null, opts: unknown) => {
        if (!inOurTree(el)) return;
        const stack = (new Error().stack ?? "")
          .split("\n")
          .slice(2, 8)
          .map((l) => l.trim().replace(/^at\s+/, ""))
          .join(" | ");
        apiRing.push(
          `${Math.round(performance.now())}ms ${method} ${describe(el)} ${JSON.stringify(opts)} <= ${stack}`,
        );
        if (apiRing.length > 60) apiRing.splice(0, apiRing.length - 60);
        flush();
      };
      const proto = Element.prototype as Element & {
        scrollIntoView: Element["scrollIntoView"];
        scrollTo: Element["scrollTo"];
        scrollBy: Element["scrollBy"];
      };
      const origIntoView = proto.scrollIntoView;
      const origScrollTo = proto.scrollTo;
      const origScrollBy = proto.scrollBy;
      proto.scrollIntoView = function patchedScrollIntoView(
        this: Element,
        arg?: boolean | ScrollIntoViewOptions,
      ) {
        recordApi("scrollIntoView", this, typeof arg === "object" ? arg : undefined);
        return origIntoView.call(this, arg as boolean | ScrollIntoViewOptions);
      };
      proto.scrollTo = function patchedScrollTo(this: Element, arg?: unknown) {
        recordApi("scrollTo", this, arg);
        return (origScrollTo as (options?: unknown) => void).call(this, arg);
      };
      proto.scrollBy = function patchedScrollBy(this: Element, arg?: unknown) {
        recordApi("scrollBy", this, arg);
        return (origScrollBy as (options?: unknown) => void).call(this, arg);
      };
      scroller.addEventListener("scroll", onScroll, { passive: true });
      scroller.addEventListener("wheel", onWheelTrace, { passive: true });
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      stopTrace = () => {
        scroller.removeEventListener("scroll", onScroll);
        scroller.removeEventListener("wheel", onWheelTrace);
        window.removeEventListener("pointermove", onPointerMove);
        proto.scrollIntoView = origIntoView;
        proto.scrollTo = origScrollTo;
        proto.scrollBy = origScrollBy;
      };
    }
    return () => {
      stopTrace();
      document.removeEventListener("selectionchange", onSelectionChange);
      scroller.removeEventListener("wheel", onWheel, { capture: true });
    };
  }, [mode]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        Logger.error("requestFullscreen error", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        Logger.error("exitFullscreen error", err);
      });
    }
  };

  // The right-bar toggle migrates between the topbar and the bar's own
  // header (AFFiNE behavior). Keyboard activation of a control that then
  // unmounts or hides would drop focus to <body>, so keyboard toggles move
  // focus to the counterpart control.
  const openToggleRef = useRef<HTMLButtonElement>(null);
  const rightBarHeaderRef = useRef<HTMLDivElement>(null);
  const toggledViaKeyboard = useRef(false);
  const prevRightBarOpenRef = useRef(isRightBarOpen);

  const toggleRightBar = (viaKeyboard: boolean) => {
    toggledViaKeyboard.current = viaKeyboard;
    setRightBarOpen((open) => {
      localStorage.setItem(RIGHTBAR_KEY, String(!open));
      return !open;
    });
  };

  useEffect(() => {
    const opened = isRightBarOpen && !prevRightBarOpenRef.current;
    const closed = !isRightBarOpen && prevRightBarOpenRef.current;
    prevRightBarOpenRef.current = isRightBarOpen;
    if (!toggledViaKeyboard.current) return;
    toggledViaKeyboard.current = false;
    if (opened) rightBarHeaderRef.current?.querySelector<HTMLElement>("button")?.focus();
    else if (closed) openToggleRef.current?.focus();
  }, [isRightBarOpen]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full w-full">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <EditorTopbar
            note={note}
            wordCount={wordCount}
            characterCount={characterCount}
            isFullWidth={isFullWidth}
            isFullscreen={isFullscreen}
            isRightBarOpen={isRightBarOpen}
            docMode={mode}
            onToggleDocMode={() =>
              updateNote(note.id, { docMode: mode === "edgeless" ? "page" : "edgeless" })
            }
            onToggleFullWidth={() =>
              updateNote(note.id, { pageWidth: isFullWidth ? "standard" : "fullWidth" })
            }
            onToggleFullscreen={toggleFullscreen}
            onToggleRightBar={toggleRightBar}
            openToggleRef={openToggleRef}
          />

          <div className="relative h-full min-h-0 min-w-0 flex-1">
            {mode === "edgeless" ? (
              <EditorErrorBoundary resetKey={`${note.id}:edgeless`}>
                <BlockSuiteSurface note={note} mode="edgeless" onEditorReady={setEditorHost} />
              </EditorErrorBoundary>
            ) : (
              <div
                ref={scrollRef}
                className="cove-doc-scroll flex h-full w-full flex-col overflow-y-auto"
              >
                <EditorHeader note={note} isFullWidth={isFullWidth} />

                <div
                  data-page-width={isFullWidth ? "fullWidth" : "standard"}
                  className={cn(
                    "flex min-h-0 w-full flex-1 flex-col",
                    !isFullWidth && "mx-auto max-w-3xl",
                  )}
                >
                  <EditorErrorBoundary resetKey={`${note.id}:page`}>
                    <BlockSuiteSurface note={note} mode="page" onEditorReady={setEditorHost} />
                  </EditorErrorBoundary>
                </div>
              </div>
            )}
            {/* Outside the doc scroller: the scroller's layout containment
                (container-type) makes it the containing block for absolute
                children, which pinned the rail to the scrollable content —
                it drifted away on long notes. Sibling of the scroller, its
                containing block is this stable wrapper instead. */}
            {mode !== "edgeless" && <OutlineViewerHost editor={editorHost} />}
          </div>
        </div>

        <EditorRightBar
          note={note}
          scrollRef={scrollRef}
          onClose={toggleRightBar}
          headerRef={rightBarHeaderRef}
          editorHost={editorHost}
          open={isRightBarOpen}
        />
      </div>
    </TooltipProvider>
  );
};

export default BlockSuiteNoteEditor;
