import { create } from "zustand";
import type { GcalAgendaEvent, GcalCalendar } from "../domain/gcal/GcalTypes";

export type GcalConnectionStatus = "disconnected" | "connecting" | "connected" | "reauth";

interface GcalState {
  status: GcalConnectionStatus;
  accountEmail: string | null;
  calendars: GcalCalendar[];
  selectedCalendarIds: string[];
  wideScopeMissing: boolean;
  events: GcalAgendaEvent[];
  lastSyncAtMs: number | null;
  syncing: boolean;
  syncFailed: boolean;
  refreshTick: number;
  setStatus: (status: GcalConnectionStatus) => void;
  setAccountEmail: (email: string | null) => void;
  setCalendars: (calendars: GcalCalendar[]) => void;
  setSelectedCalendarIds: (ids: string[]) => void;
  setWideScopeMissing: (missing: boolean) => void;
  setEvents: (events: GcalAgendaEvent[]) => void;
  setLastSyncAt: (at: number) => void;
  setSyncing: (syncing: boolean) => void;
  setSyncFailed: (failed: boolean) => void;
  bumpRefresh: () => void;
  reset: () => void;
}

export const useGcalStore = create<GcalState>()((set) => ({
  status: "disconnected",
  accountEmail: null,
  calendars: [],
  selectedCalendarIds: ["primary"],
  wideScopeMissing: false,
  events: [],
  lastSyncAtMs: null,
  syncing: false,
  syncFailed: false,
  refreshTick: 0,
  setStatus: (status) => set({ status }),
  setAccountEmail: (accountEmail) => set({ accountEmail }),
  setCalendars: (calendars) => set({ calendars }),
  setSelectedCalendarIds: (selectedCalendarIds) => set({ selectedCalendarIds }),
  setWideScopeMissing: (wideScopeMissing) => set({ wideScopeMissing }),
  setEvents: (events) => set({ events }),
  setLastSyncAt: (lastSyncAtMs) => set({ lastSyncAtMs }),
  setSyncing: (syncing) => set({ syncing }),
  setSyncFailed: (syncFailed) => set({ syncFailed }),
  bumpRefresh: () => set((state) => ({ refreshTick: state.refreshTick + 1 })),
  reset: () =>
    set({
      status: "disconnected",
      accountEmail: null,
      calendars: [],
      selectedCalendarIds: ["primary"],
      wideScopeMissing: false,
      events: [],
      lastSyncAtMs: null,
      syncing: false,
      syncFailed: false,
      refreshTick: 0,
    }),
}));
