import { toast } from '@blocksuite/affine-components/toast';
import { AttachmentBlockSchema, } from '@blocksuite/affine-model';
import { EMBED_CARD_HEIGHT, EMBED_CARD_WIDTH, } from '@blocksuite/affine-shared/consts';
import { FileSizeLimitProvider, TelemetryProvider, } from '@blocksuite/affine-shared/services';
import { formatSize } from '@blocksuite/affine-shared/utils';
import { Bound, Vec } from '@blocksuite/global/gfx';
import { GfxControllerIdentifier } from '@blocksuite/std/gfx';
export async function getAttachmentBlob(model) {
    const { sourceId$, type$ } = model.props;
    const sourceId = sourceId$.peek();
    const type = type$.peek();
    if (!sourceId)
        return null;
    const doc = model.store;
    const blob = await doc.blobSync.get(sourceId);
    if (!blob)
        return null;
    return new Blob([blob], { type });
}
/**
 * Since the size of the attachment may be very large,
 * the download process may take a long time!
 */
export function downloadAttachmentBlob(block) {
    const { host, model, blobUrl, resourceController } = block;
    if (resourceController.state$.peek().downloading) {
        toast(host, 'Download in progress...');
        return;
    }
    const name = model.props.name;
    const shortName = name.length < 20 ? name : name.slice(0, 20) + '...';
    if (!blobUrl) {
        toast(host, `Failed to download ${shortName}!`);
        return;
    }
    resourceController.updateState({ downloading: true });
    toast(host, `Downloading ${shortName}`);
    const tmpLink = document.createElement('a');
    const event = new MouseEvent('click');
    tmpLink.download = name;
    tmpLink.href = blobUrl;
    tmpLink.dispatchEvent(event);
    tmpLink.remove();
    resourceController.updateState({ downloading: false });
}
export async function refreshData(block) {
    const model = block.model;
    const type = model.props.type$.peek();
    await block.resourceController.refreshUrlWith(type);
}
export async function getFileType(file) {
    if (file.type)
        return file.type;
    // If the file type is not available, try to get it from the buffer.
    const buffer = await file.arrayBuffer();
    const FileType = await import('file-type');
    const fileType = await FileType.fileTypeFromBuffer(buffer);
    return fileType?.mime ?? '';
}
function hasExceeded(std, files, maxFileSize = std.get(FileSizeLimitProvider).maxFileSize) {
    const exceeded = files.some(file => file.size > maxFileSize);
    if (exceeded) {
        const size = formatSize(maxFileSize);
        toast(std.host, `You can only upload files less than ${size}`);
    }
    return exceeded;
}
async function buildPropsWith(std, file, embed, mode = 'doc') {
    let type = file.type;
    let category = 'success';
    try {
        const { name, size } = file;
        // TODO(@fundon): should re-upload when upload timeout
        const sourceId = await std.store.blobSync.set(file);
        type = await getFileType(file);
        return {
            name,
            size,
            type,
            sourceId,
            embed,
        };
    }
    catch (err) {
        category = 'failure';
        throw err;
    }
    finally {
        // TODO(@fundon): should change event name because this is just a local operation.
        std.getOptional(TelemetryProvider)?.track('AttachmentUploadedEvent', {
            page: `${mode} editor`,
            module: 'attachment',
            segment: mode,
            control: 'uploader',
            type,
            category,
        });
    }
}
/**
 * Add a new attachment block before / after the specified block.
 */
export async function addSiblingAttachmentBlocks(std, files, targetModel, placement = 'after', embed) {
    if (!files.length)
        return [];
    if (hasExceeded(std, files))
        return [];
    const flavour = AttachmentBlockSchema.model.flavour;
    const propsArray = await Promise.all(files.map(file => buildPropsWith(std, file, embed)));
    const blockIds = std.store.addSiblingBlocks(targetModel, propsArray.map(props => ({ ...props, flavour })), placement);
    return blockIds;
}
export async function addAttachments(std, files, point, shouldTransformPoint // determines whether we should use `toModelCoord` to convert the point
) {
    if (!files.length)
        return [];
    if (hasExceeded(std, files))
        return [];
    const propsArray = await Promise.all(files.map(file => buildPropsWith(std, file, undefined, 'whiteboard')));
    const gfx = std.get(GfxControllerIdentifier);
    let { x, y } = gfx.viewport.center;
    if (point) {
        shouldTransformPoint = shouldTransformPoint ?? true;
        if (shouldTransformPoint) {
            [x, y] = gfx.viewport.toModelCoord(...point);
        }
        else {
            [x, y] = point;
        }
    }
    const xy = [x, y];
    const style = 'cubeThick';
    const gap = 32;
    const width = EMBED_CARD_WIDTH.cubeThick;
    const height = EMBED_CARD_HEIGHT.cubeThick;
    const flavour = AttachmentBlockSchema.model.flavour;
    const blocks = propsArray.map((props, index) => {
        const center = Vec.addScalar(xy, index * gap);
        const xywh = Bound.fromCenter(center, width, height).serialize();
        return { flavour, blockProps: { ...props, style, xywh } };
    });
    const blockIds = std.store.addBlocks(blocks, gfx.surface);
    gfx.selection.set({
        elements: blockIds,
        editing: false,
    });
    return blockIds;
}
