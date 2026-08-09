import { EmbedHtmlBlockSchema } from '@blocksuite/affine-model';
import { BlockViewExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';
import { createBuiltinToolbarConfigExtension } from './configs/toolbar';
import { EmbedEdgelessHtmlBlockInteraction } from './embed-edgeless-html-block';
const flavour = EmbedHtmlBlockSchema.model.flavour;
export const EmbedHtmlViewExtensions = [
    BlockViewExtension(flavour, model => {
        return model.parent?.flavour === 'affine:surface'
            ? literal `affine-embed-edgeless-html-block`
            : literal `affine-embed-html-block`;
    }),
    createBuiltinToolbarConfigExtension(flavour),
    EmbedEdgelessHtmlBlockInteraction,
].flat();
