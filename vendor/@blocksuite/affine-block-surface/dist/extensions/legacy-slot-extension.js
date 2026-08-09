import { createIdentifier } from '@blocksuite/global/di';
import { Subject } from 'rxjs';
export const EdgelessLegacySlotIdentifier = createIdentifier('AffineEdgelessLegacySlotService');
export const EdgelessLegacySlotExtension = {
    setup: di => {
        di.addImpl(EdgelessLegacySlotIdentifier, () => ({
            readonlyUpdated: new Subject(),
            navigatorSettingUpdated: new Subject(),
            navigatorFrameChanged: new Subject(),
            fullScreenToggled: new Subject(),
            elementResizeStart: new Subject(),
            elementResizeEnd: new Subject(),
            toggleNoteSlicer: new Subject(),
            toolbarLocked: new Subject(),
        }));
    },
};
