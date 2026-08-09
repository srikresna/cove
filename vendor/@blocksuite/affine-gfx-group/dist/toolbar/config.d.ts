export declare const groupToolbarConfig: {
    readonly actions: [{
        readonly id: "a.insert-into-page";
        readonly label: "Insert into Page";
        readonly tooltip: "Insert into Page";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly when: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
        readonly run: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => void;
    }, {
        readonly id: "b.rename";
        readonly tooltip: "Rename";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly when: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
        readonly run: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => void;
    }, {
        readonly id: "b.ungroup";
        readonly tooltip: "Ungroup";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly run: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => void;
    }];
    readonly when: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
};
export declare const groupToolbarExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=config.d.ts.map