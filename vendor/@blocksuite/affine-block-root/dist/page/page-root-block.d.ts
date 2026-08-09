import { type RootBlockModel } from '@blocksuite/affine-model';
import { BlockComponent } from '@blocksuite/std';
import type { Text } from '@blocksuite/store';
import { PageKeyboardManager } from '../keyboard/keyboard-manager.js';
export declare class PageRootBlockComponent extends BlockComponent<RootBlockModel> {
    static styles: import("lit").CSSResult;
    /**
     * Focus the first paragraph in the default note block.
     * If there is no paragraph, create one.
     * @return  { id: string, created: boolean }  id of the focused paragraph and whether it is created or not
     */
    focusFirstParagraph: () => {
        id: string;
        created: boolean;
    };
    keyboardManager: PageKeyboardManager | null;
    prependParagraphWithText: (text: Text) => void;
    get rootScrollContainer(): HTMLElement;
    get viewportProvider(): import("@blocksuite/affine-shared/services").ViewportElementService;
    get viewport(): import("@blocksuite/affine-shared/types").Viewport;
    get viewportElement(): HTMLElement;
    private _createDefaultNoteBlock;
    private _getDefaultNoteBlock;
    private _initViewportResizeEffect;
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    renderBlock(): import("lit-html").TemplateResult<1>;
    accessor rootElementContainer: HTMLDivElement;
}
//# sourceMappingURL=page-root-block.d.ts.map