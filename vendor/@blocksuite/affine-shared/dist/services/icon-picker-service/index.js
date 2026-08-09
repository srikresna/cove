import { createIdentifier } from '@blocksuite/global/di';
export var IconType;
(function (IconType) {
    IconType["Emoji"] = "emoji";
    IconType["AffineIcon"] = "affine-icon";
    IconType["Blob"] = "blob";
})(IconType || (IconType = {}));
export const IconPickerServiceIdentifier = createIdentifier('IconPickerService');
