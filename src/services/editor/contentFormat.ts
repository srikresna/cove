export const BLOCKSUITE_CONTENT_FORMAT = "blocksuite-yjs-v1";

const ENVELOPE_PREFIX = `{"format":"${BLOCKSUITE_CONTENT_FORMAT}"`;

export function packBlockSuiteContent(updateB64: string): string {
  return JSON.stringify({ format: BLOCKSUITE_CONTENT_FORMAT, update: updateB64 });
}

export function unpackBlockSuiteContent(content: string): string | null {
  if (!content.startsWith(ENVELOPE_PREFIX)) return null;
  try {
    const parsed = JSON.parse(content) as { format?: unknown; update?: unknown };
    return parsed.format === BLOCKSUITE_CONTENT_FORMAT && typeof parsed.update === "string"
      ? parsed.update
      : null;
  } catch {
    return null;
  }
}

export function isBlockSuiteContent(content: string): boolean {
  return unpackBlockSuiteContent(content) !== null;
}
