import { ShieldCheck } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { useVaultStore } from "../../store/useVaultStore";

interface SetPassphraseScreenProps {
  mode: "setup" | "recover";
  onCancel?: () => void;
}

export const SetPassphraseScreen: React.FC<SetPassphraseScreenProps> = ({ mode, onCancel }) => {
  const setupPassphrase = useVaultStore((s) => s.setupPassphrase);
  const recover = useVaultStore((s) => s.recover);
  const [passphrase, setPassphrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase !== confirm) {
      setError(MESSAGES.VAULT_SET_MISMATCH);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (mode === "recover") {
        await recover(passphrase);
      } else {
        await setupPassphrase(passphrase);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set passphrase.");
    } finally {
      setBusy(false);
    }
  };

  const title = mode === "recover" ? MESSAGES.VAULT_RECOVER_TITLE : MESSAGES.VAULT_SET_TITLE;
  const desc = mode === "recover" ? MESSAGES.VAULT_RECOVER_DESC : MESSAGES.VAULT_SET_DESC;
  const button = mode === "recover" ? MESSAGES.VAULT_UNLOCK_BUTTON : MESSAGES.VAULT_SET_BUTTON;

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-cream-paper p-4 font-gelica">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-[20px] border-[1.5px] border-charcoal bg-dew-drop p-8 shadow-card-subtle"
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-3 flex h-14 w-14 items-center justify-center rounded-[16px] border-[1.5px] border-charcoal bg-cream-paper text-sticker-sprout shadow-sm"
            aria-hidden="true"
          >
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-extrabold text-cocoa-ink">{title}</h1>
          <p className="mt-1 text-xs text-slate-500">{desc}</p>
        </div>

        <label className="block">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-marker-orange">
            {MESSAGES.VAULT_PASSPHRASE_LABEL}
          </span>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder={MESSAGES.VAULT_PASSPHRASE_PLACEHOLDER}
            // biome-ignore lint/a11y/noAutofocus: full-screen setup form — the input is the sole action
            autoFocus
            autoComplete="new-password"
            className="w-full rounded-[12px] border-[1.5px] border-charcoal bg-cream-paper px-4 py-2.5 text-sm font-semibold text-cocoa-ink outline-none focus:border-marker-orange"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-marker-orange">
            {MESSAGES.VAULT_CONFIRM_LABEL}
          </span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={MESSAGES.VAULT_PASSPHRASE_PLACEHOLDER}
            autoComplete="new-password"
            className="w-full rounded-[12px] border-[1.5px] border-charcoal bg-cream-paper px-4 py-2.5 text-sm font-semibold text-cocoa-ink outline-none focus:border-marker-orange"
          />
        </label>

        {error && (
          <p role="alert" className="text-xs font-semibold text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || passphrase.length === 0}
          className="w-full rounded-[20px] border-[1.5px] border-charcoal bg-cream-paper py-2.5 text-xs font-bold text-cocoa-ink shadow-paper-lift transition-transform hover:scale-105 disabled:opacity-50"
        >
          {busy ? "…" : button}
        </button>

        {mode === "setup" && (
          <p className="text-[10px] leading-relaxed text-slate-400">{MESSAGES.VAULT_DISCLOSURE}</p>
        )}
        {mode === "recover" && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full text-center text-[11px] font-semibold text-slate-500 hover:text-marker-orange"
          >
            Back to unlock
          </button>
        )}
      </form>
    </div>
  );
};
