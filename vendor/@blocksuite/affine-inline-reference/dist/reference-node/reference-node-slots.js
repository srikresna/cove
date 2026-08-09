import { createIdentifier } from '@blocksuite/global/di';
import { Subject } from 'rxjs';
export const RefNodeSlotsProvider = createIdentifier('AffineRefNodeSlots');
const slots = {
    docLinkClicked: new Subject(),
};
export const RefNodeSlotsExtension = {
    setup: di => {
        di.addImpl(RefNodeSlotsProvider, () => slots);
    },
};
