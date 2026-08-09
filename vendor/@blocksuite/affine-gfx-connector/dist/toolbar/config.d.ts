import { type ToolbarContext, type ToolbarGenericAction } from '@blocksuite/affine-shared/services';
export declare const connectorToolbarConfig: {
    readonly actions: [{
        readonly id: "a.stroke-color";
        readonly content: (ctx: ToolbarContext) => import("lit-html").TemplateResult<1> | null;
    }, {
        readonly id: "b.style";
        readonly when: (ctx: ToolbarContext) => boolean;
        readonly content: (ctx: ToolbarContext) => import("lit-html").TemplateResult<1> | null;
    }, {
        readonly id: "c.endpoint-style";
        readonly actions: [{
            readonly id: "a.start-point-style";
            readonly content: (ctx: ToolbarContext) => import("lit-html").TemplateResult<1> | null;
        }, {
            readonly id: "b.flip-direction";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly tooltip: "Flip direction";
            readonly run: (ctx: ToolbarContext) => void;
        }, {
            readonly id: "c.end-point-style";
            readonly content: (ctx: ToolbarContext) => import("lit-html").TemplateResult<1> | null;
        }, {
            readonly id: "d.connector-shape";
            readonly content: (ctx: ToolbarContext) => import("lit-html").TemplateResult<1> | null;
        }];
    }, {
        readonly id: "g.text";
        readonly tooltip: "Add text";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly when: (ctx: ToolbarContext) => boolean;
        readonly run: (ctx: ToolbarContext) => void;
    }, ...ToolbarGenericAction[]];
    readonly when: (ctx: ToolbarContext) => boolean;
};
export declare const connectorToolbarExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=config.d.ts.map