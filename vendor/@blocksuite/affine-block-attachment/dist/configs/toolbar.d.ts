import type { ExtensionType } from '@blocksuite/store';
export declare const attachmentViewDropdownMenu: {
    readonly id: "b.conversions";
    readonly actions: [{
        readonly id: "card";
        readonly label: "Card view";
        readonly run: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => void;
    }, {
        readonly id: "embed";
        readonly label: "Embed view";
        readonly disabled: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
        readonly run: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => void;
    }];
    readonly content: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => import("lit-html").TemplateResult<1> | null;
};
export declare const createBuiltinToolbarConfigExtension: (flavour: string) => ExtensionType[];
//# sourceMappingURL=toolbar.d.ts.map