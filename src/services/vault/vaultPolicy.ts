const MIN_LENGTH = 12;

const COMMON_BLOCKLIST = new Set([
  "passwordpassword",
  "123456789012",
  "qwertyuiopas",
  "asdfghjklasd",
  "passphrase1234",
  "iloveyou12345",
  "letmeinletmein",
  "welcomeback12",
  "changemenow12",
  "administrator1",
]);

export interface PassphraseCheck {
  ok: boolean;
  error?: string;
}

export function validatePassphrase(passphrase: string): PassphraseCheck {
  if (passphrase.length < MIN_LENGTH) {
    return { ok: false, error: `Passphrase must be at least ${MIN_LENGTH} characters.` };
  }
  const hasLetter = /[a-z]/i.test(passphrase);
  const hasDigit = /\d/.test(passphrase);
  if (!hasLetter || !hasDigit) {
    return { ok: false, error: "Passphrase must contain both letters and numbers." };
  }
  if (COMMON_BLOCKLIST.has(passphrase.toLowerCase())) {
    return { ok: false, error: "That passphrase is too common; choose a stronger one." };
  }
  return { ok: true };
}
