import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { suppressNativeContextMenu } from "@/hooks/useNativeContextMenu";

describe("suppressNativeContextMenu", () => {
  it("cancels the default menu on plain surfaces", () => {
    const cleanup = suppressNativeContextMenu();
    try {
      render(<div data-testid="surface">x</div>);
      const el = document.querySelector('[data-testid="surface"]') as HTMLElement;
      const evt = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
      el.dispatchEvent(evt);
      expect(evt.defaultPrevented).toBe(true);
    } finally {
      cleanup();
    }
  });

  it("keeps the native menu inside inputs and textareas", () => {
    const cleanup = suppressNativeContextMenu();
    try {
      render(
        <main>
          <input data-testid="field" />
          <textarea data-testid="area" />
        </main>,
      );
      for (const id of ["field", "area"]) {
        const el = document.querySelector(`[data-testid="${id}"]`) as HTMLElement;
        const evt = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
        el.dispatchEvent(evt);
        expect(evt.defaultPrevented).toBe(false);
      }
    } finally {
      cleanup();
    }
  });

  it("keeps the native menu inside contenteditable editor surfaces", () => {
    const cleanup = suppressNativeContextMenu();
    try {
      render(
        <main>
          <div data-testid="rich" contentEditable="true">
            <span data-testid="rich-text">tx</span>
          </div>
        </main>,
      );
      const el = document.querySelector('[data-testid="rich-text"]') as HTMLElement;
      const evt = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
      el.dispatchEvent(evt);
      expect(evt.defaultPrevented).toBe(false);
    } finally {
      cleanup();
    }
  });

  it("suppresses inside non-editable regions marked contenteditable=false", () => {
    const cleanup = suppressNativeContextMenu();
    try {
      render(
        <div data-testid="frozen" contentEditable="false">
          <span data-testid="frozen-text">tx</span>
        </div>,
      );
      const el = document.querySelector('[data-testid="frozen-text"]') as HTMLElement;
      const evt = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
      el.dispatchEvent(evt);
      expect(evt.defaultPrevented).toBe(true);
    } finally {
      cleanup();
    }
  });

  it("never fights an earlier custom handler", () => {
    const cleanup = suppressNativeContextMenu();
    try {
      render(
        // biome-ignore lint/a11y/noStaticElementInteractions: simulates a custom-menu zone, not a real widget
        <div
          data-testid="zone"
          onContextMenu={(e) => {
            e.preventDefault();
            (e.nativeEvent as MouseEvent & { coveCustom?: boolean }).coveCustom = true;
          }}
        >
          x
        </div>,
      );
      const el = document.querySelector('[data-testid="zone"]') as HTMLElement;
      const evt = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
      el.dispatchEvent(evt);
      expect(evt.defaultPrevented).toBe(true);
      expect((evt as MouseEvent & { coveCustom?: boolean }).coveCustom).toBe(true);
    } finally {
      cleanup();
    }
  });

  it("detaches on cleanup", () => {
    const cleanup = suppressNativeContextMenu();
    cleanup();
    render(<div data-testid="surface">x</div>);
    const el = document.querySelector('[data-testid="surface"]') as HTMLElement;
    const evt = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    el.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(false);
  });
});
