import { DisposableGroup } from '@blocksuite/global/disposable';
import { onSurfaceAdded } from '../../utils/gfx.js';
import { isGfxBlockComponent, } from '../../view/index.js';
import { GfxExtension, GfxExtensionIdentifier } from '../extension.js';
import { GfxElementModelView, GfxElementModelViewExtIdentifier, } from './view.js';
export class ViewManager extends GfxExtension {
    static { this.key = 'viewManager'; }
    constructor(gfx) {
        super(gfx);
        this._disposable = new DisposableGroup();
        this._viewCtorMap = new Map();
        this._viewMap = new Map();
    }
    static extendGfx(gfx) {
        Object.defineProperty(gfx, 'view', {
            get() {
                return this.std.get(GfxExtensionIdentifier('viewManager'));
            },
        });
    }
    get(model) {
        model = typeof model === 'string' ? model : model.id;
        if (this._viewMap.has(model)) {
            return this._viewMap.get(model);
        }
        const blockView = this.std.view.getBlock(model);
        if (blockView && isGfxBlockComponent(blockView)) {
            return blockView;
        }
        return null;
    }
    mounted() {
        this.std.provider
            .getAll(GfxElementModelViewExtIdentifier)
            .forEach(viewCtor => {
            this._viewCtorMap.set(viewCtor.type, viewCtor);
        });
        const updateViewOnElementChange = (surface) => {
            const createView = (model) => {
                const ViewCtor = this._viewCtorMap.get(model.type) ?? GfxElementModelView;
                const view = new ViewCtor(model, this.gfx);
                this._viewMap.set(model.id, view);
                view.onCreated();
            };
            this._disposable.add(surface.elementAdded.subscribe(payload => {
                const model = surface.getElementById(payload.id);
                createView(model);
            }));
            this._disposable.add(surface.elementRemoved.subscribe(elem => {
                const view = this._viewMap.get(elem.id);
                this._viewMap.delete(elem.id);
                view?.onDestroyed();
            }));
            this._disposable.add(surface.localElementAdded.subscribe(model => {
                createView(model);
            }));
            this._disposable.add(surface.localElementDeleted.subscribe(model => {
                const view = this._viewMap.get(model.id);
                this._viewMap.delete(model.id);
                view?.onDestroyed();
            }));
            surface.localElementModels.forEach(model => {
                createView(model);
            });
            surface.elementModels.forEach(model => {
                createView(model);
            });
        };
        if (this.gfx.surface) {
            updateViewOnElementChange(this.gfx.surface);
        }
        else {
            this._disposable.add(onSurfaceAdded(this.std.store, surface => {
                if (surface) {
                    updateViewOnElementChange(surface);
                }
            }));
        }
    }
    unmounted() {
        this._disposable.dispose();
        this._viewMap.forEach(view => view.onDestroyed());
        this._viewMap.clear();
    }
}
