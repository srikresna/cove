import { createIdentifier } from '@blocksuite/global/di';
import {} from 'lit';
export const QuickToolIdentifier = createIdentifier('edgeless-quick-tool');
export const SeniorToolIdentifier = createIdentifier('edgeless-senior-tool');
export const QuickToolExtension = (id, builder) => {
    return {
        setup: di => {
            di.addImpl(QuickToolIdentifier(id), () => builder);
        },
    };
};
export const SeniorToolExtension = (id, builder) => {
    return {
        setup: di => {
            di.addImpl(SeniorToolIdentifier(id), () => builder);
        },
    };
};
