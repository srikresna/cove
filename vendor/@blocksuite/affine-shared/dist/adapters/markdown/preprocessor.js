import { createIdentifier, } from '@blocksuite/global/di';
import { PreprocessorManager, } from '../types/preprocessor';
const MarkdownPreprocessorIdentifier = createIdentifier('MarkdownPreprocessor');
export const MarkdownPreprocessorExtension = (preprocessor) => {
    const identifier = MarkdownPreprocessorIdentifier(preprocessor.name);
    return {
        setup: di => {
            di.addImpl(identifier, () => preprocessor);
        },
        identifier,
    };
};
export class MarkdownPreprocessorManager extends PreprocessorManager {
    constructor(provider) {
        super(provider, MarkdownPreprocessorIdentifier);
    }
}
