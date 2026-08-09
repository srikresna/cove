import { GfxCompatible, } from '@blocksuite/std/gfx';
import { BlockModel } from '@blocksuite/store';
import {} from '../../../utils/index.js';
export const EmbedIframeStyles = ['figma'];
export const defaultEmbedIframeProps = {
    url: '',
    iframeUrl: '',
    width: undefined,
    height: undefined,
    caption: null,
    title: null,
    description: null,
    xywh: '[0,0,0,0]',
    index: 'a0',
    lockedBySelf: false,
    scale: 1,
};
export class EmbedIframeBlockModel extends GfxCompatible(BlockModel) {
}
