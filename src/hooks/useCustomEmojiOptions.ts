import { useMemo } from "react";
import { useCustomIconStore } from "../store/useCustomIconStore";

export function useCustomEmojiOptions(): Array<{ id: string; names: string[]; imgUrl: string }> {
  const icons = useCustomIconStore((s) => s.icons);
  return useMemo(
    () =>
      Object.entries(icons).map(([id, entry]) => ({
        id,
        names: [entry.name],
        imgUrl: entry.dataUrl,
      })),
    [icons],
  );
}
