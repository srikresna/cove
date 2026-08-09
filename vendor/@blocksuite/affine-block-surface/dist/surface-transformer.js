import { SURFACE_TEXT_UNIQ_IDENTIFIER, SURFACE_YMAP_UNIQ_IDENTIFIER, } from '@blocksuite/std/gfx';
import { BaseBlockTransformer } from '@blocksuite/store';
import * as Y from 'yjs';
export class SurfaceBlockTransformer extends BaseBlockTransformer {
    _elementToJSON(element) {
        const value = {};
        element.forEach((_value, _key) => {
            value[_key] = this._toJSON(_value);
        });
        return value;
    }
    _fromJSON(value) {
        if (value instanceof Object) {
            if (Reflect.has(value, SURFACE_TEXT_UNIQ_IDENTIFIER)) {
                const yText = new Y.Text();
                yText.applyDelta(Reflect.get(value, 'delta'));
                return yText;
            }
            else if (Reflect.has(value, SURFACE_YMAP_UNIQ_IDENTIFIER)) {
                const yMap = new Y.Map();
                const json = Reflect.get(value, 'json');
                Object.entries(json).forEach(([key, value]) => {
                    yMap.set(key, value);
                });
                return yMap;
            }
        }
        return value;
    }
    _toJSON(value) {
        if (value instanceof Y.Text) {
            return {
                [SURFACE_TEXT_UNIQ_IDENTIFIER]: true,
                delta: value.toDelta(),
            };
        }
        else if (value instanceof Y.Map) {
            return {
                [SURFACE_YMAP_UNIQ_IDENTIFIER]: true,
                json: value.toJSON(),
            };
        }
        return value;
    }
    elementFromJSON(element) {
        const yMap = new Y.Map();
        Object.entries(element).forEach(([key, value]) => {
            yMap.set(key, this._fromJSON(value));
        });
        return yMap;
    }
    async fromSnapshot(payload) {
        const snapshotRet = await super.fromSnapshot(payload);
        const elementsJSON = snapshotRet.props.elements;
        const yMap = new Y.Map();
        Object.entries(elementsJSON).forEach(([key, value]) => {
            const element = this.elementFromJSON(value);
            yMap.set(key, element);
        });
        const elements = this._internal.Boxed(yMap);
        snapshotRet.props = {
            elements,
        };
        return snapshotRet;
    }
    toSnapshot(payload) {
        const snapshot = super.toSnapshot(payload);
        const elementsValue = payload.model.props.elements.getValue();
        const value = {};
        /**
         * When the selectedElements is defined, only the selected elements will be serialized.
         */
        const selectedElements = this.transformerConfigs.get('selectedElements');
        if (elementsValue) {
            elementsValue.forEach((element, key) => {
                if (selectedElements?.has(key) || !selectedElements) {
                    value[key] = this._elementToJSON(element);
                }
            });
        }
        snapshot.props = {
            elements: value,
        };
        return snapshot;
    }
}
