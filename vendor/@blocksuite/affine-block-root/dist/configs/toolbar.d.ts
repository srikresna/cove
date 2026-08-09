import type { ToolbarAction } from '@blocksuite/affine-shared/services';
import { ActionPlacement } from '@blocksuite/affine-shared/services';
export declare const builtinToolbarConfig: {
    readonly actions: [{
        readonly id: "a.conversions";
        readonly when: ({ chain }: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
        readonly generate: ({ chain }: import("@blocksuite/affine-shared/services").ToolbarContext) => {
            content: import("lit-html").TemplateResult<1>;
        } | null;
    }, {
        readonly id: "b.align";
        readonly when: ({ chain }: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
        readonly generate: ({ chain }: import("@blocksuite/affine-shared/services").ToolbarContext) => {
            content: import("lit-html").TemplateResult<1>;
        } | null;
    }, {
        readonly id: "b.inline-text";
        readonly when: ({ chain }: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
        readonly actions: ToolbarAction[];
    }, {
        readonly id: "c.highlight";
        readonly when: ({ chain }: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
        readonly content: ({ chain }: import("@blocksuite/affine-shared/services").ToolbarContext) => import("lit-html").TemplateResult<1>;
    }, {
        readonly id: "e.convert-to-database";
        readonly tooltip: "Create Table";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly when: ({ chain }: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
        readonly run: ({ host }: import("@blocksuite/affine-shared/services").ToolbarContext) => void;
    }, {
        readonly id: "f.convert-to-linked-doc";
        readonly tooltip: "Create Linked Doc";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly when: ({ chain, std }: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
        readonly run: ({ chain, store, selection, std, track }: import("@blocksuite/affine-shared/services").ToolbarContext) => void;
    }, {
        readonly content?: ((cx: import("@blocksuite/affine-shared/services").ToolbarContext) => import("lit-html").TemplateResult | null) | (import("lit-html").TemplateResult | null);
        readonly label?: string;
        readonly score?: number;
        readonly when?: ((cx: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean) | boolean;
        readonly active?: ((cx: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean) | boolean;
        readonly placement?: ActionPlacement;
        readonly showLabel?: boolean;
        readonly icon?: import("lit-html").TemplateResult;
        readonly tooltip?: string | import("lit-html").TemplateResult;
        readonly variant?: "destructive";
        readonly disabled?: ((cx: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean) | boolean;
        readonly run?: (cx: import("@blocksuite/affine-shared/services").ToolbarContext) => void;
        readonly id: "g.comment";
    }, {
        readonly placement: ActionPlacement.More;
        readonly id: "a.clipboard";
        readonly actions: [{
            readonly id: "copy";
            readonly label: "Copy";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly run: ({ chain, host }: import("@blocksuite/affine-shared/services").ToolbarContext) => void;
        }, {
            readonly id: "duplicate";
            readonly label: "Duplicate";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly run: ({ chain, store, selection }: import("@blocksuite/affine-shared/services").ToolbarContext) => void;
        }];
        readonly when: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
    }, {
        readonly placement: ActionPlacement.More;
        readonly id: "c.delete";
        readonly actions: [{
            readonly id: "delete";
            readonly label: "Delete";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly variant: "destructive";
            readonly run: ({ chain }: import("@blocksuite/affine-shared/services").ToolbarContext) => void;
        }];
        readonly when: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
    }];
};
//# sourceMappingURL=toolbar.d.ts.map