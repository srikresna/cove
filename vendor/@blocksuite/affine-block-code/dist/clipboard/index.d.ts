import { type Container } from '@blocksuite/global/di';
import { type BlockStdScope, Clipboard, type ClipboardAdapterConfig, LifeCycleWatcher, type UIEventHandler } from '@blocksuite/std';
import type { ExtensionType } from '@blocksuite/store';
export declare const CodeClipboardAdapterConfigIdentifier: import("@blocksuite/global/di").ServiceIdentifier<ClipboardAdapterConfig> & (<U extends ClipboardAdapterConfig = ClipboardAdapterConfig>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function CodeClipboardAdapterConfigExtension(config: ClipboardAdapterConfig): ExtensionType;
export declare class CodeBlockClipboard extends Clipboard {
    static readonly key = "code-block-clipboard";
    get _adapters(): ClipboardAdapterConfig[];
}
export declare class CodeBlockClipboardController extends LifeCycleWatcher {
    readonly clipboard: CodeBlockClipboard;
    static key: string;
    private readonly _disposables;
    constructor(std: BlockStdScope, clipboard: CodeBlockClipboard);
    static setup(di: Container): void;
    protected _init: () => void;
    onPaste: UIEventHandler;
    mounted(): void;
    unmounted(): void;
}
export declare function getCodeClipboardExtensions(): ExtensionType[];
//# sourceMappingURL=index.d.ts.map