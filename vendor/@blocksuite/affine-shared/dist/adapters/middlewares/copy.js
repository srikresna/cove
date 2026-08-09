import { TextSelection, } from '@blocksuite/std';
const isRootDraftModel = (model) => model.flavour === 'affine:root';
const handlePoint = (point, snapshot, model) => {
    const { index, length } = point;
    if (isRootDraftModel(model)) {
        if (length === 0)
            return;
        snapshot.props.title.delta =
            model.props.title.sliceToDelta(index, length + index);
        return;
    }
    if (!snapshot.props.text || length === 0) {
        return;
    }
    snapshot.props.text.delta =
        model.text?.sliceToDelta(index, length + index);
};
const sliceText = (slots, std) => {
    const afterExportSubscription = slots.afterExport.subscribe(payload => {
        if (payload.type === 'block') {
            const snapshot = payload.snapshot;
            const model = payload.model;
            const text = std.selection.find(TextSelection);
            if (text && text.from.blockId === model.id) {
                handlePoint(text.from, snapshot, model);
                return;
            }
            if (text && text.to && text.to.blockId === model.id) {
                handlePoint(text.to, snapshot, model);
                return;
            }
        }
    });
    return () => {
        afterExportSubscription.unsubscribe();
    };
};
export const copyMiddleware = (std) => {
    return ({ slots }) => {
        return sliceText(slots, std);
    };
};
