import {
  embedSyncedDocMiddleware,
  MarkdownAdapterFactoryIdentifier,
  PlainTextAdapterFactoryIdentifier,
} from "@blocksuite/affine/shared/adapters";
import type React from "react";
import { useEffect, useState } from "react";
import { blockSuiteEditorService } from "../../di/container";
import { cn } from "../../lib/utils";

type Format = "markdown" | "plaintext";

interface AdapterStore {
  getTransformer(middlewares: unknown[]): unknown;
  get(id: unknown): {
    get(job: unknown): { fromDoc(store: unknown): Promise<{ file?: string } | null> };
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

  useEffect(() => {
    let cancelled = false;
    const store = blockSuiteEditorService.getDocStoreForPeek(
      noteId,
    ) as unknown as AdapterStore | null;
    if (!store) return;
    setLoading(true);
    void (async () => {
      try {
        const job = store.getTransformer([embedSyncedDocMiddleware("content")]);
        const factoryId =
          format === "markdown"
            ? MarkdownAdapterFactoryIdentifier
            : PlainTextAdapterFactoryIdentifier;
        const adapter = store.get(factoryId).get(job);
        const result = await adapter.fromDoc(store);
        if (!cancelled) setContent(result?.file ?? "");
      } catch {
        if (!cancelled) setContent("");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [noteId, format]);

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
        ) : (
          <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-foreground/90">
            {content || "(empty)"}
          </pre>
        )}
      </div>
    </div>
  );
};
