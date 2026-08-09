import { ActionPlacement, type ToolbarAction, type ToolbarContext } from '@blocksuite/affine-shared/services';
import { type ExtensionType } from '@blocksuite/store';
export declare const builtinToolbarConfig: {
    readonly actions: [ToolbarAction, {
        id: string;
        when: (ctx: ToolbarContext) => boolean;
        actions: ({
            id: string;
            label: string;
            run(ctx: ToolbarContext): void;
            disabled?: undefined;
        } | {
            id: string;
            label: string;
            disabled: true;
            run?: undefined;
        })[];
        content(ctx: ToolbarContext): import("lit-html").TemplateResult<1> | null;
    }, ToolbarAction, {
        readonly id: "e.convert-to-linked-doc";
        readonly tooltip: "Create Linked Doc";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly run: (ctx: ToolbarContext) => void;
    }, {
        readonly placement: ActionPlacement.More;
        readonly id: "a.clipboard";
        readonly actions: [{
            readonly id: "copy";
            readonly label: "Copy";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly run: (ctx: ToolbarContext) => void;
        }, {
            readonly id: "duplicate";
            readonly label: "Duplicate";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly run: (ctx: ToolbarContext) => void;
        }];
    }, {
        readonly placement: ActionPlacement.More;
        readonly id: "b.reload";
        readonly label: "Reload";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly run: (ctx: ToolbarContext) => void;
    }, {
        readonly placement: ActionPlacement.More;
        readonly id: "c.delete";
        readonly label: "Delete";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly variant: "destructive";
        readonly run: (ctx: ToolbarContext) => void;
    }];
};
export declare const builtinSurfaceToolbarConfig: {
    readonly actions: [ToolbarAction, {
        id: string;
        when: (ctx: ToolbarContext) => boolean;
        actions: ({
            id: string;
            label: string;
            run(ctx: ToolbarContext): void;
            disabled?: undefined;
        } | {
            id: string;
            label: string;
            disabled: true;
            run?: undefined;
        })[];
        content(ctx: ToolbarContext): import("lit-html").TemplateResult<1> | null;
    }, ToolbarAction, {
        readonly id: "e.scale";
        readonly content: (ctx: ToolbarContext) => import("lit-html").TemplateResult<1> | null;
    }];
    readonly when: (ctx: ToolbarContext) => boolean;
};
export declare const createBuiltinToolbarConfigExtension: (flavour: string) => ExtensionType[];
//# sourceMappingURL=toolbar.d.ts.map