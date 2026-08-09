/**
 * Manager class for handling preprocessors
 * @template T Type of content to process
 * @template P Type of preprocessor
 */
export class PreprocessorManager {
    constructor(provider, identifier) {
        this.provider = provider;
        this.identifier = identifier;
        this.preprocessors = new Map();
        // Initialize Sets for each level
        this.preprocessors.set('doc', new Set());
        this.preprocessors.set('slice', new Set());
        this.preprocessors.set('block', new Set());
        // Register all preprocessors from provider
        this.initializePreprocessors();
    }
    /**
     * Initialize preprocessors from provider
     */
    initializePreprocessors() {
        const preprocessors = Array.from(this.provider.getAll(this.identifier).values());
        for (const preprocessor of preprocessors) {
            for (const level of preprocessor.levels) {
                const levelSet = this.preprocessors.get(level);
                if (levelSet) {
                    levelSet.add(preprocessor);
                }
            }
        }
    }
    /**
     * Pre process content at specified level
     * @param level Level to process at
     * @param content Content to process
     * @returns Processed content
     */
    process(level, content) {
        const processors = this.preprocessors.get(level) ?? new Set();
        return Array.from(processors).reduce((result, preprocessor) => preprocessor.preprocess(result), content);
    }
}
