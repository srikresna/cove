import { Lock } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { useVaultStore } from "../../store/useVaultStore";

interface UnlockScreenProps {
  onRecover: () => void;
}

export const UnlockScreen: React.FC<UnlockScreenProps> = ({ onRecover }) => {
  const unlock = useVaultStore((s) => s.unlock);
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await unlock(passphrase);
    } catch {
      setError(MESSAGES.VAULT_UNLOCK_ERROR);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-cream-paper font-gelica">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-[20px] border-[1.5px] border-charcoal bg-dew-drop p-8 shadow-card-subtle"
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-3 flex h-14 w-14 items-center justify-center rounded-[16px] border-[1.5px] border-charcoal bg-cream-paper text-marker-orange shadow-sm"
            aria-hidden="true"
          >
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-extrabold text-cocoa-ink">{MESSAGES.VAULT_UNLOCK_TITLE}</h1>
          <p className="mt-1 text-xs text-slate-500">{MESSAGES.VAULT_UNLOCK_DESC}</p>
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
            // biome-ignore lint/a11y/noAutofocus: full-screen unlock form — the input is the sole action
            autoFocus
            autoComplete="current-password"
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
          {MESSAGES.VAULT_UNLOCK_BUTTON}
        </button>

        <button
          type="button"
          onClick={onRecover}
          className="w-full text-center text-[11px] font-semibold text-slate-500 hover:text-marker-orange"
        >
          {MESSAGES.VAULT_RECOVER_LINK}
        </button>
      </form>
    </div>
  );
};
