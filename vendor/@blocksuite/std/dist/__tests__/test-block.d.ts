import { BlockComponent, GfxBlockComponent } from '../view/index.js';
import type { HeadingBlockModel, NoteBlockModel, RootBlockModel, SurfaceBlockModel, TestGfxBlockModel } from './test-schema.js';
export declare class RootBlockComponent extends BlockComponent<RootBlockModel> {
    renderBlock(): import("lit-html").TemplateResult<1>;
}
export declare class NoteBlockComponent extends BlockComponent<NoteBlockModel> {
    renderBlock(): import("lit-html").TemplateResult<1>;
}
export declare class HeadingH1BlockComponent extends BlockComponent<HeadingBlockModel> {
    renderBlock(): import("lit-html").TemplateResult<1>;
}
export declare class HeadingH2BlockComponent extends BlockComponent<HeadingBlockModel> {
    renderBlock(): import("lit-html").TemplateResult<1>;
}
export declare class SurfaceBlockComponent extends BlockComponent<SurfaceBlockModel> {
    renderBlock(): import("lit-html").TemplateResult<1>;
}
export declare class TestGfxBlockComponent extends GfxBlockComponent<TestGfxBlockModel> {
    renderGfxBlock(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=test-block.d.ts.map