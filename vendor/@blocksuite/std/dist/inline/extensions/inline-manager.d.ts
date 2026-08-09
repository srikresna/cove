import { type ServiceIdentifier } from '@blocksuite/global/di';
import { type BaseTextAttributes, type DeltaInsert, type ExtensionType } from '@blocksuite/store';
import { z } from 'zod';
import type { BlockStdScope } from '../../scope/index.js';
import type { AttributeRenderer } from '../types.js';
import type { InlineMarkdownMatch, InlineSpecs } from './type.js';
export declare class InlineManager<TextAttributes extends BaseTextAttributes> {
    readonly std: BlockStdScope;
    readonly enableMarkdown: boolean;
    embedChecker: (delta: DeltaInsert<TextAttributes>) => boolean;
    getRenderer: () => AttributeRenderer<TextAttributes>;
    getSchema: () => z.ZodSchema;
    get markdownMatches(): InlineMarkdownMatch<TextAttributes>[];
    readonly specs: Array<InlineSpecs<TextAttributes>>;
    constructor(std: BlockStdScope, enableMarkdown: boolean, ...specs: Array<InlineSpecs<TextAttributes>>);
}
export type InlineManagerExtensionConfig<TextAttributes extends BaseTextAttributes> = {
    id: string;
    enableMarkdown?: boolean;
    specs: ServiceIdentifier<InlineSpecs<TextAttributes>>[];
};
export declare function InlineManagerExtension<TextAttributes extends BaseTextAttributes>({ id, enableMarkdown, specs, }: InlineManagerExtensionConfig<TextAttributes>): ExtensionType & {
    identifier: ServiceIdentifier<InlineManager<TextAttributes>>;
};
//# sourceMappingURL=inline-manager.d.ts.map