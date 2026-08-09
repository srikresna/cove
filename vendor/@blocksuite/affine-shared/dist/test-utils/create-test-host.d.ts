import { type EditorHost } from '@blocksuite/std';
import type { Store } from '@blocksuite/store';
/**
 * Create a test host object
 *
 * This function creates a mock host object that includes doc and command properties,
 * which can be used for testing command execution.
 *
 * Usage:
 * ```typescript
 * const doc = affine`<affine-page></affine-page>`;
 * const host = createTestHost(doc);
 *
 * // Use host.command.exec to execute commands
 * const [_, result] = host.command.exec(someCommand, {
 *   // command params
 * });
 * ```
 *
 * @param doc Document object
 * @returns Host object containing doc and command
 */
export declare function createTestHost(doc: Store): EditorHost;
//# sourceMappingURL=create-test-host.d.ts.map