import { useEffect } from "react";

const isEditableSurface = (start: Element | null): boolean => {
  for (let node = start; node; node = node.parentElement) {
    if (!(node instanceof HTMLElement)) continue;
    if (node.tagName === "INPUT" || node.tagName === "TEXTAREA") return true;
    if (node.isContentEditable) return true;
    const attr = node.getAttribute("contenteditable");
    if (attr === "true" || attr === "") return true;
  }
  return false;
};

export function suppressNativeContextMenu(): () => void {
  const onContextMenu = (e: MouseEvent) => {
    if (e.defaultPrevented) return;
    const target = e.target instanceof Element ? e.target : null;
    if (isEditableSurface(target)) return;
    e.preventDefault();
  };
  document.addEventListener("contextmenu", onContextMenu);
  return () => document.removeEventListener("contextmenu", onContextMenu);
}

export const useNativeContextMenuSuppression = (): void => {
  useEffect(suppressNativeContextMenu, []);
};
