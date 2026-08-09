import { ShapeElementModel } from '@blocksuite/affine-model';
import { type ToolbarGenericAction } from '@blocksuite/affine-shared/services';
export declare const shapeToolbarConfig: {
    readonly actions: [{
        readonly id: "c.switch-type";
        readonly when: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
        readonly content: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => import("lit-html").TemplateResult<1> | null;
    }, {
        readonly id: "d.style";
        readonly when: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
        readonly content: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => import("lit-html").TemplateResult<1> | null;
    }, {
        readonly id: "e.color";
        readonly when: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
        readonly content: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => import("lit-html").TemplateResult<1> | null;
    }, {
        readonly id: "f.text";
        readonly tooltip: "Add text";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly when: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
        readonly run: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => void;
    }, ...ToolbarGenericAction[]];
    readonly when: (ctx: import("@blocksuite/affine-shared/services").ToolbarContext) => boolean;
};
export declare function hasGrouped(model: ShapeElementModel): boolean;
export declare const shapeToolbarExtension: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=config.d.ts.map