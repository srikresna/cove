import { Lock } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { useVaultStore } from "../../store/useVaultStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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
    <div className="flex min-h-screen w-screen items-center justify-center bg-background p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-lg border bg-card p-8 shadow-sm"
      >
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary"
          aria-hidden="true"
        >
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-center font-display text-2xl font-medium tracking-tight">
            {MESSAGES.VAULT_UNLOCK_TITLE}
          </h1>
          <p className="text-center text-sm text-muted-foreground">{MESSAGES.VAULT_UNLOCK_DESC}</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="unlock-passphrase">{MESSAGES.VAULT_PASSPHRASE_LABEL}</Label>
          <Input
            id="unlock-passphrase"
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder={MESSAGES.VAULT_PASSPHRASE_PLACEHOLDER}
            // biome-ignore lint/a11y/noAutofocus: full-screen unlock form — the input is the sole action
            autoFocus
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy || passphrase.length === 0} className="w-full">
          {MESSAGES.VAULT_UNLOCK_BUTTON}
        </Button>

        <Button type="button" variant="link" size="sm" onClick={onRecover} className="w-full">
          {MESSAGES.VAULT_RECOVER_LINK}
        </Button>
      </form>
    </div>
  );
};
