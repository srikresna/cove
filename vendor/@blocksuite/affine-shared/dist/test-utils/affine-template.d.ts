import { type Block, type ExtensionType } from '@blocksuite/store';
export declare function createAffineTemplate(extensions?: ExtensionType[]): {
    affine: (strings: TemplateStringsArray, ...values: any[]) => import("@blocksuite/std").EditorHost;
    block: (strings: TemplateStringsArray, ...values: any[]) => Block | null;
};
export declare const affine: (strings: TemplateStringsArray, ...values: any[]) => import("@blocksuite/std").EditorHost, block: (strings: TemplateStringsArray, ...values: any[]) => Block | null;
//# sourceMappingURL=affine-template.d.ts.map