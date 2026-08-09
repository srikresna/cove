import type { FootNote } from '@blocksuite/affine-model';
import { type BlockStdScope } from '@blocksuite/std';
import type { ExtensionType } from '@blocksuite/store';
import type { TemplateResult } from 'lit';
type FootNoteNodeRenderer = (footnote: FootNote, std: BlockStdScope) => TemplateResult<1>;
type FootNotePopupRenderer = (footnote: FootNote, std: BlockStdScope, abortController: AbortController) => TemplateResult<1>;
export type FootNotePopupClickHandler = (footnote: FootNote, abortController: AbortController) => void;
export interface FootNoteNodeConfig {
    customNodeRenderer?: FootNoteNodeRenderer;
    customPopupRenderer?: FootNotePopupRenderer;
    interactive?: boolean;
    hidePopup?: boolean;
    disableHoverEffect?: boolean;
    onPopupClick?: FootNotePopupClickHandler;
}
export declare class FootNoteNodeConfigProvider {
    readonly std: BlockStdScope;
    private _customNodeRenderer?;
    private _customPopupRenderer?;
    private _hidePopup;
    private _interactive;
    private _disableHoverEffect;
    private _onPopupClick?;
    get customNodeRenderer(): FootNoteNodeRenderer | undefined;
    get customPopupRenderer(): FootNotePopupRenderer | undefined;
    get onPopupClick(): FootNotePopupClickHandler | undefined;
    get doc(): import("@blocksuite/store").Store;
    get hidePopup(): boolean;
    get interactive(): boolean;
    get disableHoverEffect(): boolean;
    constructor(config: FootNoteNodeConfig, std: BlockStdScope);
    setCustomNodeRenderer(renderer: FootNoteNodeRenderer): void;
    setCustomPopupRenderer(renderer: FootNotePopupRenderer): void;
    setHidePopup(hidePopup: boolean): void;
    setInteractive(interactive: boolean): void;
    setDisableHoverEffect(disableHoverEffect: boolean): void;
    setPopupClick(onPopupClick: FootNotePopupClickHandler): void;
}
export declare const FootNoteNodeConfigIdentifier: import("@blocksuite/global/di").ServiceIdentifier<FootNoteNodeConfigProvider> & (<U extends FootNoteNodeConfigProvider = FootNoteNodeConfigProvider>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function FootNoteNodeConfigExtension(config: FootNoteNodeConfig): ExtensionType;
export {};
//# sourceMappingURL=footnote-config.d.ts.map