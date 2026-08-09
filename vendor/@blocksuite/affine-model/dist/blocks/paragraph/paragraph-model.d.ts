import { BlockModel, type Text } from '@blocksuite/store';
import type { TextAlign } from '../../consts';
import type { BlockMeta } from '../../utils/types';
export type ParagraphType = 'text' | 'quote' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type ParagraphProps = {
    type: ParagraphType;
    textAlign?: TextAlign;
    text: Text;
    collapsed: boolean;
    comments?: Record<string, boolean>;
} & BlockMeta;
export declare const ParagraphBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<ParagraphProps>;
        flavour: "affine:paragraph";
    } & {
        version: number;
        role: "content";
        parent: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<ParagraphProps>) | undefined;
};
export declare const ParagraphBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
export declare class ParagraphBlockModel extends BlockModel<ParagraphProps> {
    isEmpty(): boolean;
}
//# sourceMappingURL=paragraph-model.d.ts.map