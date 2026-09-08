import {
  embedSyncedDocMiddleware,
  MarkdownAdapterFactoryIdentifier,
  PlainTextAdapterFactoryIdentifier,
} from "@blocksuite/affine/shared/adapters";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { blockSuiteEditorService } from "../../di/container";
import { cn } from "../../lib/utils";
import { MarkdownBlocks, parseMarkdown } from "./markdownPreview";

type Format = "markdown" | "plaintext";

interface AdapterStore {
  getTransformer(middlewares: unknown[]): unknown;
  get(id: unknown): {
    get(job: unknown): { fromDoc(store: unknown): Promise<{ file?: string } | null> };
  };
  workspace?: {
    blobSync?: { get(key: string): Promise<Blob | null> };
  };
}

const TABS: ReadonlyArray<{ value: Format; label: string }> = [
  { value: "markdown", label: "Markdown" },
  { value: "plaintext", label: "Plain Text" },
];

export const LivePreview: React.FC<{ noteId: string }> = ({ noteId }) => {
  const [format, setFormat] = useState<Format>("markdown");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const created: string[] = [];
    const store = blockSuiteEditorService.getDocStoreForPeek(
      noteId,
    ) as unknown as AdapterStore | null;
    if (!store) {
      setContent("");
      setImageUrls({});
      setLoading(false);
      return;
    }
    setLoading(true);
    void (async () => {
      try {
        const job = (
          store as unknown as {
            getTransformer(m: unknown[]): unknown;
          }
        ).getTransformer([embedSyncedDocMiddleware("content")]);
        const factoryId =
          format === "markdown"
            ? MarkdownAdapterFactoryIdentifier
            : PlainTextAdapterFactoryIdentifier;
        const adapter = store.get(factoryId).get(job) as {
          fromDoc(store: unknown): Promise<{ file?: string; assetsIds?: string[] } | null>;
        };
        const result = await adapter.fromDoc(store);
        if (cancelled) return;

        const urls: Record<string, string> = {};
        const assetsIds = result?.assetsIds ?? [];
        if (format === "markdown" && assetsIds.length > 0) {
          const blobSync = store.workspace?.blobSync;
          if (blobSync) {
            await Promise.all(
              assetsIds.map(async (id) => {
                try {
                  const blob = await blobSync.get(id);
                  if (!blob) return;
                  const url = URL.createObjectURL(blob);
                  if (cancelled) {
                    URL.revokeObjectURL(url);
                    return;
                  }
                  created.push(url);
                  urls[id] = url;
                } catch {}
              }),
            );
          }
        }
        if (cancelled) return;
        setImageUrls(urls);
        setContent(result?.file ?? "");
      } catch {
        if (!cancelled) {
          setContent("");
          setImageUrls({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      for (const url of created) URL.revokeObjectURL(url);
    };
  }, [noteId, format]);

  const blocks = useMemo(
    () => (format === "markdown" ? parseMarkdown(content) : []),
    [format, content],
  );

  const resolveImage = (url: string): string | undefined => {
    let name = url.split("/").pop() ?? url;
    try {
      name = decodeURIComponent(name);
    } catch {}
    const blobId = name.replace(/\.[a-z0-9]+$/i, "");
    return imageUrls[blobId];
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 gap-1 border-b px-1 pb-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setFormat(t.value)}
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium transition-colors",
              format === t.value
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-2">
        {loading ? (
          <p className="text-xs text-muted-foreground">Generating…</p>
        ) : format === "markdown" && content ? (
          <div className="text-sm">
            <MarkdownBlocks blocks={blocks} resolveImage={resolveImage} />
          </div>
        ) : (
          <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-foreground/90">
            {content || "(empty)"}
          </pre>
        )}
      </div>
    </div>
  );
};
