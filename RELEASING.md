# Cove Notes releases

Cove Notes checks the public GitHub Releases feed for signed Windows NSIS updates.
The Tauri updater public key is in `src-tauri/tauri.conf.json`; the matching
private key must remain outside the repository.

## Configure the release signing secret

The release workflow expects the repository secret `TAURI_SIGNING_PRIVATE_KEY`.
For the key generated on this development machine, set it without printing it:

```powershell
Get-Content -Raw "$env:USERPROFILE\.tauri\cove-notes.key" |
  gh secret set TAURI_SIGNING_PRIVATE_KEY --repo srikresna/cove
```

The generated key has no password, so no password secret is needed. Never commit
the private `.key` file. Keep a secure backup because future app updates must be
signed with the same private key.

## Publish a release

1. Update the version consistently in `package.json`, `package-lock.json`,
   `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`,
   and the fallback version in `src/features/settings/AboutSection.tsx`.
2. Commit and push the version change to `master`.
3. Create and push the matching tag, for example `v0.1.1` for version `0.1.1`.
4. GitHub Actions builds the NSIS installer, signs updater artifacts, and
   publishes `latest.json` plus the installer assets to GitHub Releases.

The first updater-enabled release must be installed manually by users whose
current Cove build does not yet include the updater. Later releases can be
installed in Cove from **Settings → Updates**.
