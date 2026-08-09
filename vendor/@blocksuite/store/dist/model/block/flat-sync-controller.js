import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import * as Y from 'yjs';
import { ReactiveFlatYMap } from '../../reactive/flat-native-y/index.js';
import { BlockModel } from './block-model.js';
import { internalPrimitives } from './zod.js';
export class FlatSyncController {
    constructor(schema, yBlock, doc, onChange) {
        this.schema = schema;
        this.yBlock = yBlock;
        this.doc = doc;
        this.onChange = onChange;
        const { id, flavour, version, yChildren, props } = this._parseYBlock();
        this.id = id;
        this.flavour = flavour;
        this.yChildren = yChildren;
        this.version = version;
        this.model = this._createModel(props);
    }
    _createModel(props) {
        const schema = this.schema.flavourSchemaMap.get(this.flavour);
        if (!schema) {
            throw new BlockSuiteError(ErrorCode.ModelCRUDError, `schema for flavour: ${this.flavour} not found`);
        }
        const model = schema.model.toModel?.() ?? new BlockModel();
        const defaultProps = schema.model.props?.(internalPrimitives);
        model.schema = schema;
        model.id = this.id;
        model.keys = Array.from(props);
        model.yBlock = this.yBlock;
        const reactive = new ReactiveFlatYMap(this.yBlock, model.deleted, this.onChange, defaultProps);
        this._reactive = reactive;
        const proxy = reactive.proxy;
        model._props = proxy;
        model.stash = this.stash;
        model.pop = this.pop;
        if (this.doc) {
            model.store = this.doc;
        }
        return model;
    }
    _parseYBlock() {
        let id;
        let flavour;
        let version;
        let yChildren;
        const props = new Set();
        this.yBlock.forEach((value, key) => {
            if (key === 'sys:id' && typeof value === 'string') {
                id = value;
                return;
            }
            if (key === 'sys:flavour' && typeof value === 'string') {
                flavour = value;
                return;
            }
            if (key === 'sys:children' && value instanceof Y.Array) {
                yChildren = value;
                return;
            }
            if (key === 'sys:version' && typeof value === 'number') {
                version = value;
                return;
            }
            if (key.startsWith('prop:')) {
                const keyName = key.replace('prop:', '');
                const keys = keyName.split('.');
                const propKey = keys[0];
                props.add(propKey);
                return;
            }
        });
        if (!id) {
            throw new BlockSuiteError(ErrorCode.ModelCRUDError, 'block id is not found when creating model');
        }
        if (!flavour) {
            throw new BlockSuiteError(ErrorCode.ModelCRUDError, 'block flavour is not found when creating model');
        }
        if (!yChildren) {
            throw new BlockSuiteError(ErrorCode.ModelCRUDError, 'block children is not found when creating model');
        }
        const schema = this.schema.flavourSchemaMap.get(flavour);
        if (!schema) {
            throw new BlockSuiteError(ErrorCode.ModelCRUDError, `schema for flavour: ${flavour} not found`);
        }
        if (typeof version !== 'number') {
            // no version found in data, set to schema version
            version = schema.version;
        }
        const defaultProps = schema.model.props?.(internalPrimitives);
        // Set default props if not exists
        if (defaultProps) {
            Object.keys(defaultProps).forEach(key => {
                if (props.has(key))
                    return;
                props.add(key);
            });
        }
        return {
            id,
            flavour,
            version,
            props,
            yChildren,
        };
    }
    get stash() {
        return this._reactive.stash;
    }
    get pop() {
        return this._reactive.pop;
    }
}
