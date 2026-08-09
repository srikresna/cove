import { type SurfaceTextModelMap, type TextStyleProps } from '@blocksuite/affine-model';
import { type ToolbarContext } from '@blocksuite/affine-shared/services';
export declare function createTextActions<K extends abstract new (...args: any) => any, T extends keyof SurfaceTextModelMap>(klass: K, type: T, update?: (ctx: ToolbarContext, model: InstanceType<K>, props: Partial<TextStyleProps>) => void, mapInto?: (model: InstanceType<K>) => TextStyleProps, stash?: <P extends keyof TextStyleProps>(model: InstanceType<K>, type: 'stash' | 'pop', field: P) => void): [{
    readonly id: "a.font";
    readonly content: (ctx: ToolbarContext) => import("lit-html").TemplateResult<1> | null;
}, {
    readonly id: "b.text-color";
    readonly content: (ctx: ToolbarContext) => import("lit-html").TemplateResult<1> | null;
}, {
    readonly id: "c.font-style";
    readonly content: (ctx: ToolbarContext) => import("lit-html").TemplateResult<1> | null;
}, {
    readonly id: "d.font-size";
    readonly when: boolean;
    readonly content: (ctx: ToolbarContext) => import("lit-html").TemplateResult<1> | null;
}, {
    readonly id: "e.alignment";
    readonly content: (ctx: ToolbarContext) => import("lit-html").TemplateResult<1> | null;
}];
//# sourceMappingURL=actions.d.ts.map