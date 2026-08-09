import { type Signal } from '@blocksuite/affine-shared/utils';
import { type BlockComponent, type BlockStdScope } from '@blocksuite/std';
import type { TemplateResult } from 'lit';
export type KeyboardToolbarConfig = {
    items: KeyboardToolbarItem[];
};
export type KeyboardToolbarItem = KeyboardToolbarActionItem | KeyboardSubToolbarConfig | KeyboardToolPanelConfig;
export type KeyboardIconType = TemplateResult | ((ctx: KeyboardToolbarContext) => TemplateResult);
export type KeyboardToolbarActionItem = {
    name: string;
    icon: KeyboardIconType;
    background?: string | ((ctx: KeyboardToolbarContext) => string | undefined);
    /**
     * @default true
     * @description Whether to show the item in the toolbar.
     */
    showWhen?: (ctx: KeyboardToolbarContext) => boolean;
    /**
     * @default false
     * @description Whether to set the item as disabled status.
     */
    disableWhen?: (ctx: KeyboardToolbarContext) => boolean;
    /**
     * @description The action to be executed when the item is clicked.
     */
    action?: (ctx: KeyboardToolbarContext) => void | Promise<void>;
};
export type KeyboardSubToolbarConfig = {
    icon: KeyboardIconType;
    items: KeyboardToolbarItem[];
    /**
     * It will enter this sub-toolbar when the condition is met.
     */
    autoShow?: (ctx: KeyboardToolbarContext) => Signal<boolean>;
};
export type KeyboardToolbarContext = {
    std: BlockStdScope;
    rootComponent: BlockComponent;
    /**
     * Close current tool panel and show virtual keyboard
     */
    closeToolPanel: () => void;
};
export type KeyboardToolPanelConfig = {
    icon: KeyboardIconType;
    activeIcon?: KeyboardIconType;
    activeBackground?: string;
    groups: (KeyboardToolPanelGroup | DynamicKeyboardToolPanelGroup)[];
};
export type KeyboardToolPanelGroup = {
    name: string;
    items: KeyboardToolbarActionItem[];
};
export type DynamicKeyboardToolPanelGroup = (ctx: KeyboardToolbarContext) => KeyboardToolPanelGroup | null;
export declare const defaultKeyboardToolbarConfig: KeyboardToolbarConfig;
export declare const KeyboardToolbarConfigExtension: import("@blocksuite/std").ConfigFactory<Partial<KeyboardToolbarConfig>>;
//# sourceMappingURL=config.d.ts.map