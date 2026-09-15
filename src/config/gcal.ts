export const DEFAULT_GCAL_CLIENT_ID = "";
export const DEFAULT_GCAL_CLIENT_SECRET = "";

let clientIdOverride = DEFAULT_GCAL_CLIENT_ID;
let clientSecretOverride = DEFAULT_GCAL_CLIENT_SECRET;

export const setGcalClientCredentials = (clientId: string, clientSecret: string): void => {
  clientIdOverride = clientId.trim() || DEFAULT_GCAL_CLIENT_ID;
  clientSecretOverride = clientSecret.trim() || DEFAULT_GCAL_CLIENT_SECRET;
};

export const getGcalClientId = (): string => clientIdOverride;

export const getGcalClientSecret = (): string => clientSecretOverride;
