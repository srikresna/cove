import { createIdentifier } from '@blocksuite/global/di';
import { signal } from '@preact/signals-core';
export const ShowQuickSettingBarKey = createIdentifier('show-quick-setting-bar');
export const createDefaultShowQuickSettingBar = () => {
    return signal({});
};
