export const DEFAULT_GCAL_CLIENT_ID = "";
export const DEFAULT_GCAL_CLIENT_SECRET = "";

let clientIdOverride = DEFAULT_GCAL_CLIENT_ID;
let clientSecretOverride = DEFAULT_GCAL_CLIENT_SECRET;
let remindersEnabled = true;

export const setGcalClientCredentials = (clientId: string, clientSecret: string): void => {
  clientIdOverride = clientId.trim() || DEFAULT_GCAL_CLIENT_ID;
  clientSecretOverride = clientSecret.trim() || DEFAULT_GCAL_CLIENT_SECRET;
};

export const getGcalClientId = (): string => clientIdOverride;

export const getGcalClientSecret = (): string => clientSecretOverride;

export const setGcalRemindersEnabled = (enabled: boolean): void => {
  remindersEnabled = enabled;
};

export const getGcalRemindersEnabled = (): boolean => remindersEnabled;

export const GCAL_REMINDER_LEAD_OPTIONS = [5, 10, 15, 30] as const;

let reminderLeadMinutes = 10;

export const setGcalReminderLeadMinutes = (minutes: number): void => {
  reminderLeadMinutes = GCAL_REMINDER_LEAD_OPTIONS.includes(
    minutes as (typeof GCAL_REMINDER_LEAD_OPTIONS)[number],
  )
    ? minutes
    : 10;
};

export const getGcalReminderLeadMinutes = (): number => reminderLeadMinutes;
