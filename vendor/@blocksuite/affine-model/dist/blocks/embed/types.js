import { EmbedFigmaModel } from './figma';
import { EmbedGithubModel } from './github';
import { EmbedLinkedDocModel } from './linked-doc';
import { EmbedLoomModel } from './loom';
import { EmbedSyncedDocModel } from './synced-doc';
import { EmbedYoutubeModel } from './youtube';
export const ExternalEmbedModels = [
    EmbedFigmaModel,
    EmbedGithubModel,
    EmbedLoomModel,
    EmbedYoutubeModel,
];
export const InternalEmbedModels = [
    EmbedLinkedDocModel,
    EmbedSyncedDocModel,
];
export function isExternalEmbedModel(model) {
    return (model instanceof EmbedFigmaModel ||
        model instanceof EmbedGithubModel ||
        model instanceof EmbedLoomModel ||
        model instanceof EmbedYoutubeModel);
}
export function isInternalEmbedModel(model) {
    return (model instanceof EmbedLinkedDocModel || model instanceof EmbedSyncedDocModel);
}
