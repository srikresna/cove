import { createIdentifier } from '@blocksuite/global/di';
export const TelemetryProvider = createIdentifier('AffineTelemetryService');
export const TelemetryExtension = (service) => {
    return {
        setup: di => {
            di.override(TelemetryProvider, () => service);
        },
    };
};
