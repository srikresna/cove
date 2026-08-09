import { FrameBlockSchema } from '@blocksuite/affine-model';
import { BlockViewExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';
import { FrameBlockInteraction } from './frame-block';
import { EdgelessFrameManager, FrameOverlay } from './frame-manager';
const flavour = FrameBlockSchema.model.flavour;
export const FrameBlockSpec = [
    BlockViewExtension(flavour, literal `affine-frame`),
    FrameOverlay,
    EdgelessFrameManager,
    FrameBlockInteraction,
];
