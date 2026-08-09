import { ActionPlacement } from '@blocksuite/affine-shared/services';
export declare const builtinInlineLinkToolbarConfig: {
    readonly actions: [{
        readonly id: "a.preview";
        readonly content: (cx: import("@blocksuite/affine-shared/services").ToolbarContext) => import("lit-html").TemplateResult<1> | null;
    }, {
        readonly id: "b.copy-link-and-edit";
        readonly actions: [{
            readonly id: "copy-link";
            readonly tooltip: "Copy link";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly run: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => void;
        }, {
            readonly id: "edit";
            readonly tooltip: "Edit Description";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly run: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => void;
        }];
    }, {
        id: string;
        actions: ({
            id: string;
            label: string;
            disabled: true;
            run?: undefined;
            when?: undefined;
        } | {
            id: string;
            label: string;
            run(ctx: import("@blocksuite/affine-shared/services").ToolbarContext): void;
            disabled?: undefined;
            when?: undefined;
        } | {
            id: string;
            label: string;
            when(ctx: import("@blocksuite/affine-shared/services").ToolbarContext): boolean;
            run(ctx: import("@blocksuite/affine-shared/services").ToolbarContext): void;
            disabled?: undefined;
        })[];
        content(ctx: import("@blocksuite/affine-shared/services").ToolbarContext): import("lit-html").TemplateResult<1> | null;
        when(ctx: import("@blocksuite/affine-shared/services").ToolbarContext): boolean;
    }, {
        readonly placement: ActionPlacement.More;
        readonly id: "b.remove-link";
        readonly label: "Remove link";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly run: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => void;
    }, {
        readonly placement: ActionPlacement.More;
        readonly id: "c.delete";
        readonly label: "Delete";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly variant: "destructive";
        readonly run: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => void;
    }];
};
//# sourceMappingURL=toolbar.d.ts.map