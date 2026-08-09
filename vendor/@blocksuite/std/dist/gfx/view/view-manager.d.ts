import { type GfxBlockComponent } from '../../view/index.js';
import type { GfxController } from '../controller.js';
import { GfxExtension } from '../extension.js';
import type { GfxModel } from '../model/model.js';
import type { GfxLocalElementModel } from '../model/surface/local-element-model.js';
import { GfxElementModelView } from './view.js';
export declare class ViewManager extends GfxExtension {
    static key: string;
    private readonly _disposable;
    private readonly _viewCtorMap;
    private readonly _viewMap;
    constructor(gfx: GfxController);
    static extendGfx(gfx: GfxController): void;
    get(model: GfxModel | GfxLocalElementModel | string): GfxElementModelView | GfxBlockComponent | null;
    mounted(): void;
    unmounted(): void;
}
declare module '../controller.js' {
    interface GfxController {
        readonly view: ViewManager;
    }
}
//# sourceMappingURL=view-manager.d.ts.map