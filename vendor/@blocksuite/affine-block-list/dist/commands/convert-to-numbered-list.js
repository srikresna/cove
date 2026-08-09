import { toNumberedList } from '@blocksuite/affine-shared/utils';
export const convertToNumberedListCommand = (ctx, next) => {
    const { std, id, order, stopCapturing = true } = ctx;
    const host = std.host;
    const doc = host.store;
    const model = doc.getBlock(id)?.model;
    if (!model || !model.text)
        return;
    if (stopCapturing)
        host.store.captureSync();
    const listConvertedId = toNumberedList(std, model, order);
    if (!listConvertedId)
        return;
    return next({ listConvertedId });
};
