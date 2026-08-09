import { type BlockStdScope } from '@blocksuite/std';
import type { TemplateResult } from 'lit';
import type { AffineReference } from './reference-node';
export interface ReferenceNodeConfig {
    customContent?: (reference: AffineReference) => TemplateResult;
    interactable?: boolean;
    hidePopup?: boolean;
}
export declare const ReferenceNodeConfigExtension: import("@blocksuite/std").ConfigFactory<ReferenceNodeConfig>;
export declare class ReferenceNodeConfigProvider {
    readonly std: BlockStdScope;
    private _customContent;
    private _hidePopup;
    private _interactable;
    get customContent(): ((reference: AffineReference) => TemplateResult) | undefined;
    get doc(): import("@blocksuite/store").Store;
    get hidePopup(): boolean;
    get interactable(): boolean;
    constructor(std: BlockStdScope);
    setCustomContent(content: ReferenceNodeConfigProvider['_customContent']): void;
    setHidePopup(hidePopup: boolean): void;
    setInteractable(interactable: boolean): void;
}
//# sourceMappingURL=reference-config.d.ts.map