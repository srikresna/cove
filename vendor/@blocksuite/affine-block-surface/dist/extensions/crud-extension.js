import { EditPropsStore } from '@blocksuite/affine-shared/services';
import { createIdentifier } from '@blocksuite/global/di';
import { StdIdentifier } from '@blocksuite/std';
import { GfxBlockElementModel, GfxControllerIdentifier, isGfxGroupCompatibleModel, } from '@blocksuite/std/gfx';
import { Extension } from '@blocksuite/store';
import { getLastPropsKey } from '../utils/get-last-props-key';
import { isConnectable, isNoteBlock } from './query';
export const EdgelessCRUDIdentifier = createIdentifier('AffineEdgelessCrudService');
export class EdgelessCRUDExtension extends Extension {
    constructor(std) {
        super();
        this.std = std;
        this.deleteElements = (elements) => {
            const surface = this._surface;
            if (!surface) {
                console.error('surface is not initialized');
                return;
            }
            const gfx = this.std.get(GfxControllerIdentifier);
            const set = new Set(elements);
            elements.forEach(element => {
                if (isConnectable(element)) {
                    const connectors = surface.getConnectors(element.id);
                    connectors.forEach(connector => set.add(connector));
                }
            });
            set.forEach(element => {
                if (isNoteBlock(element)) {
                    const children = gfx.doc.root?.children ?? [];
                    if (children.length > 1) {
                        gfx.doc.deleteBlock(element);
                    }
                }
                else {
                    gfx.deleteElement(element.id);
                }
            });
        };
        this.addBlock = (flavour, props, parentId, parentIndex) => {
            const gfx = this.std.get(GfxControllerIdentifier);
            const key = getLastPropsKey(flavour, props);
            if (key) {
                props = this.std.get(EditPropsStore).applyLastProps(key, props);
            }
            const nProps = {
                ...props,
                index: gfx.layer.generateIndex(),
            };
            return this.std.store.addBlock(flavour, nProps, parentId, parentIndex);
        };
        this.addElement = (type, props) => {
            const surface = this._surface;
            if (!surface) {
                console.error('surface is not initialized');
                return;
            }
            const gfx = this.std.get(GfxControllerIdentifier);
            const key = getLastPropsKey(type, props);
            if (key) {
                props = this.std.get(EditPropsStore).applyLastProps(key, props);
            }
            const nProps = {
                ...props,
                type,
                index: props.index ?? gfx.layer.generateIndex(),
            };
            return surface.addElement(nProps);
        };
        this.updateElement = (id, props) => {
            const surface = this._surface;
            if (!surface) {
                console.error('surface is not initialized');
                return;
            }
            const element = this._surface.getElementById(id);
            if (element) {
                const key = getLastPropsKey(element.type, {
                    ...element.yMap.toJSON(),
                    ...props,
                });
                key && this.std.get(EditPropsStore).recordLastProps(key, props);
                this._surface.updateElement(id, props);
                return;
            }
            const block = this.std.store.getModelById(id);
            if (block) {
                const key = getLastPropsKey(block.flavour, {
                    ...block.yBlock.toJSON(),
                    ...props,
                });
                key && this.std.get(EditPropsStore).recordLastProps(key, props);
                this.std.store.updateBlock(block, props);
            }
        };
    }
    static setup(di) {
        di.add(this, [StdIdentifier]);
        di.addImpl(EdgelessCRUDIdentifier, provider => provider.get(this));
    }
    get _gfx() {
        return this.std.get(GfxControllerIdentifier);
    }
    get _surface() {
        return this._gfx.surface;
    }
    getElementById(id) {
        const surface = this._surface;
        if (!surface) {
            return null;
        }
        const el = surface.getElementById(id) ?? this.std.store.getModelById(id);
        return el;
    }
    getElementsByType(type) {
        if (!this._surface) {
            return [];
        }
        return this._surface.getElementsByType(type);
    }
    removeElement(id) {
        id = typeof id === 'string' ? id : id.id;
        const el = this.getElementById(id);
        if (isGfxGroupCompatibleModel(el)) {
            el.childIds.forEach(childId => {
                this.removeElement(childId);
            });
        }
        if (el instanceof GfxBlockElementModel) {
            this.std.store.deleteBlock(el);
            return;
        }
        if (this._surface?.hasElementById(id)) {
            this._surface.deleteElement(id);
            return;
        }
    }
}
