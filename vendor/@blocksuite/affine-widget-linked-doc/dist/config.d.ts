import { insertLinkedNode } from '@blocksuite/affine-inline-reference';
import type { AffineInlineEditor } from '@blocksuite/affine-shared/types';
import { type Signal } from '@blocksuite/affine-shared/utils';
import { type BlockStdScope, type EditorHost } from '@blocksuite/std';
import type { InlineRange } from '@blocksuite/std/inline';
import type { TemplateResult } from 'lit';
import type { LinkedDocViewExtensionOptions } from './view';
export type LinkedWidgetConfig = Required<Omit<LinkedDocViewExtensionOptions, 'autoFocusedItemKey'>> & Pick<LinkedDocViewExtensionOptions, 'autoFocusedItemKey'>;
export type LinkedMenuItem = {
    key: string;
    name: string | TemplateResult<1>;
    icon: TemplateResult<1>;
    suffix?: string | TemplateResult<1>;
    action: LinkedMenuAction;
};
export type LinkedMenuAction = () => Promise<void> | void;
export type LinkedMenuGroup = {
    name: string;
    items: LinkedMenuItem[] | Signal<LinkedMenuItem[]>;
    styles?: string;
    maxDisplay?: number;
    loading?: boolean | Signal<boolean>;
    overflowText?: string | Signal<string>;
    hidden?: boolean | Signal<boolean>;
};
export type LinkedDocContext = {
    std: BlockStdScope;
    inlineEditor: AffineInlineEditor;
    startRange: InlineRange;
    startNativeRange: Range;
    triggerKey: string;
    config: LinkedWidgetConfig;
    close: () => void;
};
export declare function createLinkedDocMenuGroup(query: string, abort: () => void, editorHost: EditorHost, inlineEditor: AffineInlineEditor): {
    name: string;
    items: {
        key: string;
        name: string;
        icon: TemplateResult<1>;
        action: () => void;
    }[];
    maxDisplay: number;
    overflowText: string;
};
export declare function createNewDocMenuGroup(query: string, abort: () => void, editorHost: EditorHost, inlineEditor: AffineInlineEditor): LinkedMenuGroup;
export declare function getMenus(query: string, abort: () => void, editorHost: EditorHost, inlineEditor: AffineInlineEditor): Promise<LinkedMenuGroup[]>;
export declare const LinkedWidgetUtils: {
    createNewDocMenuGroup: typeof createNewDocMenuGroup;
    insertLinkedNode: typeof insertLinkedNode;
};
export declare const AFFINE_LINKED_DOC_WIDGET = "affine-linked-doc-widget";
export declare const LinkedWidgetConfigExtension: import("@blocksuite/std").ConfigFactory<Partial<LinkedWidgetConfig>>;
//# sourceMappingURL=config.d.ts.map