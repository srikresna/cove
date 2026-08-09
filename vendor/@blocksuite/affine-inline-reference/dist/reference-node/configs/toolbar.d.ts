import { ActionPlacement } from '@blocksuite/affine-shared/services';
export declare const builtinInlineReferenceToolbarConfig: {
    readonly actions: [{
        readonly id: "a.doc-title";
        readonly content: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => import("lit-html").TemplateResult<1> | null;
    }, {
        id: string;
        actions: ({
            id: string;
            label: string;
            disabled: true;
            run?: undefined;
        } | {
            id: string;
            label: string;
            run(ctx: import("@blocksuite/affine-shared/services").ToolbarContext): void;
            disabled?: undefined;
        } | {
            id: string;
            label: string;
            disabled(ctx: import("@blocksuite/affine-shared/services").ToolbarContext): boolean;
            run(ctx: import("@blocksuite/affine-shared/services").ToolbarContext): void;
        })[];
        content(ctx: import("@blocksuite/affine-shared/services").ToolbarContext): import("lit-html").TemplateResult<1> | null;
        when(ctx: import("@blocksuite/affine-shared/services").ToolbarContext): boolean;
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