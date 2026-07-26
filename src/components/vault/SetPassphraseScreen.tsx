import { ShieldCheck } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { useVaultStore } from "../../store/useVaultStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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
    <div className="flex min-h-screen w-screen items-center justify-center bg-background p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-lg border bg-card p-8 shadow-sm"
      >
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary"
          aria-hidden="true"
        >
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-center font-display text-2xl font-medium tracking-tight">{title}</h1>
          <p className="text-center text-sm text-muted-foreground">{desc}</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="vault-passphrase">{MESSAGES.VAULT_PASSPHRASE_LABEL}</Label>
          <Input
            id="vault-passphrase"
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder={MESSAGES.VAULT_PASSPHRASE_PLACEHOLDER}
            autoFocus
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="vault-confirm">{MESSAGES.VAULT_CONFIRM_LABEL}</Label>
          <Input
            id="vault-confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={MESSAGES.VAULT_PASSPHRASE_PLACEHOLDER}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy || passphrase.length === 0} className="w-full">
          {busy ? "…" : button}
        </Button>

        {mode === "setup" && (
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {MESSAGES.VAULT_DISCLOSURE}
          </p>
        )}
        {mode === "recover" && onCancel && (
          <Button type="button" variant="link" size="sm" onClick={onCancel} className="w-full">
            Back to unlock
          </Button>
        )}
      </form>
    </div>
  );
};
