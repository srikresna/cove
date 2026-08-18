import { create } from "zustand";
import { vaultService } from "../di/container";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}
export interface PromptOptions extends ConfirmOptions {
  autofill?: string;
  placeholder?: string;
}

interface BlockSuiteDialogState {
  open: boolean;
  kind: "confirm" | "prompt" | null;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  placeholder: string;
  input: string;
  resolve: ((value: boolean | string | null) => void) | null;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  prompt: (opts: PromptOptions) => Promise<string | null>;
  setInput: (value: string) => void;

  ok: () => void;

  cancel: () => void;
}

export const useBlockSuiteDialogStore = create<BlockSuiteDialogState>((set, get) => ({
  open: false,
  kind: null,
  title: "",
  message: "",
  confirmText: "OK",
  cancelText: "Cancel",
  placeholder: "",
  input: "",
  resolve: null,
  confirm: (opts) =>
    new Promise<boolean>((resolve) => {
      get().resolve?.(false);
      set({
        open: true,
        kind: "confirm",
        title: opts.title,
        message: opts.message,
        confirmText: opts.confirmText ?? "OK",
        cancelText: opts.cancelText ?? "Cancel",
        input: "",
        resolve: resolve as (value: boolean | string | null) => void,
      });
    }),
  prompt: (opts) =>
    new Promise<string | null>((resolve) => {
      get().resolve?.(null);
      set({
        open: true,
        kind: "prompt",
        title: opts.title,
        message: opts.message,
        confirmText: opts.confirmText ?? "OK",
        cancelText: opts.cancelText ?? "Cancel",
        placeholder: opts.placeholder ?? "",
        input: opts.autofill ?? "",
        resolve: resolve as (value: boolean | string | null) => void,
      });
    }),
  setInput: (value) => set({ input: value }),
  ok: () => {
    const { kind, input, resolve } = get();
    resolve?.(kind === "prompt" ? input : true);
    set({ open: false, kind: null, resolve: null });
  },
  cancel: () => {
    const { kind, resolve } = get();
    resolve?.(kind === "prompt" ? null : false);
    set({ open: false, kind: null, resolve: null });
  },
}));

vaultService.onLock(() => {
  const { resolve } = useBlockSuiteDialogStore.getState();
  resolve?.(null);
  useBlockSuiteDialogStore.setState({ open: false, kind: null, resolve: null });
});
