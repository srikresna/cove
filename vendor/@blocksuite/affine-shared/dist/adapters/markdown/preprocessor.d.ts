import { type ServiceIdentifier, type ServiceProvider } from '@blocksuite/global/di';
import type { ExtensionType } from '@blocksuite/store';
import { type AdapterPreprocessor, PreprocessorManager } from '../types/preprocessor';
import type { Markdown } from './type';
export type MarkdownAdapterPreprocessor = AdapterPreprocessor<Markdown>;
export declare const MarkdownPreprocessorExtension: (preprocessor: MarkdownAdapterPreprocessor) => ExtensionType & {
    identifier: ServiceIdentifier<MarkdownAdapterPreprocessor>;
};
export declare class MarkdownPreprocessorManager extends PreprocessorManager<Markdown, MarkdownAdapterPreprocessor> {
    constructor(provider: ServiceProvider);
}
//# sourceMappingURL=preprocessor.d.ts.map