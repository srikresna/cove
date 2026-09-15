export const DEFAULT_GCAL_CLIENT_ID = "";

let clientIdOverride = DEFAULT_GCAL_CLIENT_ID;

export const setGcalClientIdOverride = (clientId: string): void => {
  clientIdOverride = clientId.trim() || DEFAULT_GCAL_CLIENT_ID;
};

export const getGcalClientId = (): string => clientIdOverride;
