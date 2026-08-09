import type { ServiceIdentifier, ServiceProvider } from '@blocksuite/global/di';
/**
 * Level of preprocessing
 * - doc: Process at to doc snapshot level
 * - slice: Process at to slice snapshot level
 * - block: Process at to block snapshot level
 */
export type PreprocessLevel = 'doc' | 'slice' | 'block';
/**
 * Interface for adapter preprocessor
 * @template T Type of content to process, defaults to string
 */
export type AdapterPreprocessor<T = string> = {
    /**
     * Unique name of the preprocessor
     */
    name: string;
    /**
     * Levels this preprocessor supports
     */
    levels: PreprocessLevel[];
    /**
     * Process the content
     * @param content Content to process
     * @returns Processed content
     */
    preprocess: (content: T) => T;
};
/**
 * Manager class for handling preprocessors
 * @template T Type of content to process
 * @template P Type of preprocessor
 */
export declare abstract class PreprocessorManager<T, P extends AdapterPreprocessor<T>> {
    protected readonly provider: ServiceProvider;
    protected readonly identifier: ServiceIdentifier<P>;
    protected readonly preprocessors: Map<PreprocessLevel, Set<P>>;
    constructor(provider: ServiceProvider, identifier: ServiceIdentifier<P>);
    /**
     * Initialize preprocessors from provider
     */
    private initializePreprocessors;
    /**
     * Pre process content at specified level
     * @param level Level to process at
     * @param content Content to process
     * @returns Processed content
     */
    process(level: PreprocessLevel, content: T): T;
}
//# sourceMappingURL=preprocessor.d.ts.map