import type { UIEventHandler } from '@blocksuite/std';
import type { BlockSnapshot, Store } from '@blocksuite/store';
import { ReadOnlyClipboard } from './readonly-clipboard';
/**
 * PageClipboard is a class that provides a clipboard for the page root block.
 * It is supported to copy and paste models in the page root block.
 */
export declare class PageClipboard extends ReadOnlyClipboard {
    static key: string;
    protected _init: () => void;
    onBlockSnapshotPaste: (snapshot: BlockSnapshot, doc: Store, parent?: string, index?: number) => Promise<string | null>;
    onPageCut: UIEventHandler;
    onPagePaste: UIEventHandler;
    mounted(): void;
}
//# sourceMappingURL=page-clipboard.d.ts.map