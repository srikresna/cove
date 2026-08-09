import type { ParagraphBlockModel } from '@blocksuite/affine-model';
export interface ParagraphBlockConfig {
    getPlaceholder: (model: ParagraphBlockModel) => string;
}
export declare const ParagraphBlockConfigExtension: import("@blocksuite/std").ConfigFactory<ParagraphBlockConfig>;
//# sourceMappingURL=paragraph-block-config.d.ts.map