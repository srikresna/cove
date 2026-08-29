import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

/**
 * Tracks an element's content-box width via ResizeObserver. The journal
 * topbar uses it to hide affordances (Today < 300px, TemplateMark < 400px).
 */
export function useElementWidth<T extends HTMLElement>(): [RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w === "number") setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
