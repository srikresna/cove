const MIN_LENGTH = 6;

export interface PassphraseCheck {
  ok: boolean;
  error?: string;
}

export function validatePassphrase(passphrase: string): PassphraseCheck {
  if (passphrase.length < MIN_LENGTH) {
    return { ok: false, error: `Passphrase must be at least ${MIN_LENGTH} characters.` };
  }
  return { ok: true };
}
