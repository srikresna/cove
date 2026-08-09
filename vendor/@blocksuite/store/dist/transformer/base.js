import { BlockModel } from '../model/block/block-model';
import { toDraftModel } from '../model/block/draft';
import { internalPrimitives, } from '../model/block/zod';
import { fromJSON, toJSON } from './json';
export class BaseBlockTransformer {
    _propsFromSnapshot(propsJson) {
        return Object.fromEntries(Object.entries(propsJson).map(([key, value]) => {
            return [key, fromJSON(value)];
        }));
    }
    _propsToSnapshot(model) {
        let draftModel;
        if (model instanceof BlockModel) {
            draftModel = toDraftModel(model);
        }
        else {
            draftModel = model;
        }
        return Object.fromEntries(draftModel.keys.map(key => {
            const value = draftModel.props[key];
            return [key, toJSON(value)];
        }));
    }
    constructor(transformerConfigs) {
        this.transformerConfigs = transformerConfigs;
        this._internal = internalPrimitives;
    }
    fromSnapshot({ json, }) {
        const { flavour, id, version, props: _props } = json;
        const props = this._propsFromSnapshot(_props);
        return {
            id,
            flavour,
            version: version ?? -1,
            props,
        };
    }
    toSnapshot({ model }) {
        const { id, flavour, version } = model;
        const props = this._propsToSnapshot(model);
        return {
            id,
            flavour,
            version,
            props,
        };
    }
}
