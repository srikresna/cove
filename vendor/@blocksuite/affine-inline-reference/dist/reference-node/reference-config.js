import { ConfigExtensionFactory } from '@blocksuite/std';
export const ReferenceNodeConfigExtension = ConfigExtensionFactory('AffineReferenceNodeConfig');
export class ReferenceNodeConfigProvider {
    get customContent() {
        return this._customContent;
    }
    get doc() {
        return this.std.store;
    }
    get hidePopup() {
        return this._hidePopup;
    }
    get interactable() {
        return this._interactable;
    }
    constructor(std) {
        this.std = std;
        this._customContent = undefined;
        this._hidePopup = false;
        this._interactable = true;
    }
    setCustomContent(content) {
        this._customContent = content;
    }
    setHidePopup(hidePopup) {
        this._hidePopup = hidePopup;
    }
    setInteractable(interactable) {
        this._interactable = interactable;
    }
}
