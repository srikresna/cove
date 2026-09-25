export interface GcalEventDateTime {
  dateTime?: string;
  date?: string;
}

export interface GcalExtendedProperties {
  private?: Record<string, string>;
}

export interface GcalEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: GcalEventDateTime;
  end: GcalEventDateTime;
  hangoutLink?: string;
  colorId?: string;
  eventType?: string;
  status?: string;
  htmlLink?: string;
  extendedProperties?: GcalExtendedProperties;
}

export interface GcalEventInput {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: GcalEventDateTime;
  end: GcalEventDateTime;
  extendedProperties?: GcalExtendedProperties;
}

export interface GcalEventPatch {
  summary: string;
  description?: string;
  location?: string;
  start: GcalEventDateTime;
  end: GcalEventDateTime;
  extendedProperties?: GcalExtendedProperties;
}

export type GcalAgendaEvent = GcalEvent & {
  calendarId: string;
  calendarColor?: string;
};

export interface GcalCalendar {
  id: string;
  summary: string;
  backgroundColor?: string;
  foregroundColor?: string;
  primary: boolean;
}

export interface GcalTokens {
  refreshToken: string;
  accessToken: string;
  expiresAtMs: number;
  scope: string;
}

export interface GcalAccessToken {
  accessToken: string;
  expiresAtMs: number;
  scope: string;
}

export const GCAL_SCOPE = "https://www.googleapis.com/auth/calendar.events";
export const GCAL_SCOPES = `${GCAL_SCOPE} https://www.googleapis.com/auth/calendar.readonly`;

export const isCoveCreatedEvent = (event: GcalEvent): boolean =>
  event.extendedProperties?.private?.cove === "1";
