import { MenuContext } from '@blocksuite/affine-components/toolbar';
import type { CodeBlockComponent } from '../code-block';
export declare class CodeBlockToolbarContext extends MenuContext {
    blockComponent: CodeBlockComponent;
    abortController: AbortController;
    setActive: (active: boolean) => void;
    close: () => void;
    get doc(): import("@blocksuite/store").Store;
    get host(): import("@blocksuite/std").EditorHost;
    get selectedBlockModels(): import("@blocksuite/affine-model").CodeBlockModel[];
    get std(): import("@blocksuite/std").BlockStdScope;
    constructor(blockComponent: CodeBlockComponent, abortController: AbortController, setActive: (active: boolean) => void);
    isEmpty(): boolean;
    isMultiple(): boolean;
    isSingle(): boolean;
}
//# sourceMappingURL=context.d.ts.map