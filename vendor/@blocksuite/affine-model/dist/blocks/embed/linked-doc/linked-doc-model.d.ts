import type { ReferenceInfo } from '../../../consts/doc.js';
export declare const EmbedLinkedDocStyles: ["vertical", "horizontal", "list", "cube", "horizontalThin", "citation"];
export type EmbedLinkedDocBlockProps = {
    style: (typeof EmbedLinkedDocStyles)[number];
    caption: string | null;
    footnoteIdentifier: string | null;
} & ReferenceInfo;
declare const EmbedLinkedDocModel_base: {
    new (): import("@blocksuite/std/gfx").GfxBlockElementModel<import("../../../index.js").EmbedProps<EmbedLinkedDocBlockProps>>;
};
export declare class EmbedLinkedDocModel extends EmbedLinkedDocModel_base {
}
export {};
//# sourceMappingURL=linked-doc-model.d.ts.map