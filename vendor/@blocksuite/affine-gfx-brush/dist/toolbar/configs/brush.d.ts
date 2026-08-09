export declare const brushToolbarConfig: {
    readonly actions: [{
        readonly id: "a.line-width";
        readonly content: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => import("lit-html").TemplateResult<1> | null;
    }, {
        readonly id: "b.color-picker";
        readonly content: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => import("lit-html").TemplateResult<1> | null;
    }];
    readonly when: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
};
export declare const brushToolbarExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=brush.d.ts.map