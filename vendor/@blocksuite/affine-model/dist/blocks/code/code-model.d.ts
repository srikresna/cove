import { BlockModel, type Text } from '@blocksuite/store';
import type { BlockMeta } from '../../utils/types';
type CodeBlockProps = {
    text: Text;
    language: string | null;
    wrap: boolean;
    caption: string;
    preview?: boolean;
    lineNumber?: boolean;
    collapsed?: boolean;
    comments?: Record<string, boolean>;
} & BlockMeta;
export declare const CodeBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<CodeBlockProps>;
        flavour: "affine:code";
    } & {
        version: number;
        role: "content";
        parent: string[];
        children: never[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<CodeBlockProps>) | undefined;
};
export declare const CodeBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
export declare class CodeBlockModel extends BlockModel<CodeBlockProps> {
}
export {};
//# sourceMappingURL=code-model.d.ts.map