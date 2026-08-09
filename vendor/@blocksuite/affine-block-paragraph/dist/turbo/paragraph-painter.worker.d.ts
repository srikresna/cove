import type { BlockLayout, TextRect } from '@blocksuite/affine-gfx-turbo-renderer';
interface SentenceLayout {
    text: string;
    rects: TextRect[];
    fontSize: number;
}
export interface ParagraphLayout extends BlockLayout {
    type: 'affine:paragraph';
    sentences: SentenceLayout[];
}
export declare const ParagraphLayoutPainterExtension: import("@blocksuite/store").ExtensionType;
export {};
//# sourceMappingURL=paragraph-painter.worker.d.ts.map