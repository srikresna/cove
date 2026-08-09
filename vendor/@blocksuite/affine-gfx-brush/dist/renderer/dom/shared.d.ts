import type { DomRenderer } from '@blocksuite/affine-block-surface';
import type { BrushElementModel, HighlighterElementModel } from '@blocksuite/affine-model';
type BrushLikeModel = BrushElementModel | HighlighterElementModel;
export declare function renderBrushLikeDom({ color, domElement, model, renderer, }: {
    color: string;
    domElement: HTMLElement;
    model: BrushLikeModel;
    renderer: DomRenderer;
}): void;
export {};
//# sourceMappingURL=shared.d.ts.map