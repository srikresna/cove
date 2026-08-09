import { DisposableGroup } from '@blocksuite/global/disposable';
import type { EditorHost } from '@blocksuite/std';
export declare function scrollToBlock(host: EditorHost, blockId: string): void;
export declare function isBlockBeforeViewportCenter(blockId: string, editorHost: EditorHost): boolean;
export declare const observeActiveHeadingDuringScroll: (getEditor: () => EditorHost, // workaround for editor changed
update: (activeHeading: string | null) => void) => DisposableGroup;
export declare function scrollToBlockWithHighlight(host: EditorHost, blockId: string, timeout?: number): Promise<() => void>;
//# sourceMappingURL=scroll.d.ts.map