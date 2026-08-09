import { GfxPrimitiveElementModel, } from './surface/element-model.js';
export const isPrimitiveModel = (model) => {
    return model instanceof GfxPrimitiveElementModel;
};
