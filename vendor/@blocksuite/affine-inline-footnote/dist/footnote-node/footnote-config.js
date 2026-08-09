import { createIdentifier } from '@blocksuite/global/di';
import { StdIdentifier } from '@blocksuite/std';
export class FootNoteNodeConfigProvider {
    get customNodeRenderer() {
        return this._customNodeRenderer;
    }
    get customPopupRenderer() {
        return this._customPopupRenderer;
    }
    get onPopupClick() {
        return this._onPopupClick;
    }
    get doc() {
        return this.std.store;
    }
    get hidePopup() {
        return this._hidePopup;
    }
    get interactive() {
        return this._interactive;
    }
    get disableHoverEffect() {
        return this._disableHoverEffect;
    }
    constructor(config, std) {
        this.std = std;
        this._customNodeRenderer = config.customNodeRenderer;
        this._customPopupRenderer = config.customPopupRenderer;
        this._hidePopup = config.hidePopup ?? false;
        this._interactive = config.interactive ?? true;
        this._disableHoverEffect = config.disableHoverEffect ?? false;
        this._onPopupClick = config.onPopupClick;
    }
    setCustomNodeRenderer(renderer) {
        this._customNodeRenderer = renderer;
    }
    setCustomPopupRenderer(renderer) {
        this._customPopupRenderer = renderer;
    }
    setHidePopup(hidePopup) {
        this._hidePopup = hidePopup;
    }
    setInteractive(interactive) {
        this._interactive = interactive;
    }
    setDisableHoverEffect(disableHoverEffect) {
        this._disableHoverEffect = disableHoverEffect;
    }
    setPopupClick(onPopupClick) {
        this._onPopupClick = onPopupClick;
    }
}
export const FootNoteNodeConfigIdentifier = createIdentifier('AffineFootNoteNodeConfig');
export function FootNoteNodeConfigExtension(config) {
    return {
        setup: di => {
            di.addImpl(FootNoteNodeConfigIdentifier, provider => new FootNoteNodeConfigProvider(config, provider.get(StdIdentifier)));
        },
    };
}
