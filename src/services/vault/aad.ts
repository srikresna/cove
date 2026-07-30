/**
 * Additional Authenticated Data (AAD) namespaces for AES-GCM payloads.
 *
 * Note content and cover images are encrypted under the same DEK. Binding each
 * ciphertext to a distinct AAD means a cover ciphertext can never be replayed as
 * note content (or vice versa) — GCM authentication fails on the mismatch.
 *
 * This is encryption wire-format knowledge, so it lives with the vault layer
 * rather than in the domain.
 */

/** AAD for a note's cover image — must differ from the content AAD (bare id). */
export const coverAad = (noteId: string): string => `cover:${noteId}`;

/** AAD for a note's title — distinct from content/cover so a title ciphertext
 *  cannot be replayed as note content or a cover image. */
export const titleAad = (noteId: string): string => `title:${noteId}`;

/** AAD for a stored blob (image/attachment) — distinct from all note payloads. */
export const blobAad = (blobId: string): string => `blob:${blobId}`;
