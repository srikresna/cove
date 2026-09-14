import { create } from "zustand";
import type { GcalCalendar, GcalEvent } from "../domain/gcal/GcalTypes";

export type GcalConnectionStatus = "disconnected" | "connecting" | "connected" | "reauth";

interface GcalState {
  status: GcalConnectionStatus;
  accountEmail: string | null;
  calendars: GcalCalendar[];
  events: GcalEvent[];
  lastSyncAtMs: number | null;
  syncing: boolean;
  refreshTick: number;
  setStatus: (status: GcalConnectionStatus) => void;
  setAccountEmail: (email: string | null) => void;
  setCalendars: (calendars: GcalCalendar[]) => void;
  setEvents: (events: GcalEvent[]) => void;
  setLastSyncAt: (at: number) => void;
  setSyncing: (syncing: boolean) => void;
  bumpRefresh: () => void;
  reset: () => void;
}

export const useGcalStore = create<GcalState>()((set) => ({
  status: "disconnected",
  accountEmail: null,
  calendars: [],
  events: [],
  lastSyncAtMs: null,
  syncing: false,
  refreshTick: 0,
  setStatus: (status) => set({ status }),
  setAccountEmail: (accountEmail) => set({ accountEmail }),
  setCalendars: (calendars) => set({ calendars }),
  setEvents: (events) => set({ events }),
  setLastSyncAt: (lastSyncAtMs) => set({ lastSyncAtMs }),
  setSyncing: (syncing) => set({ syncing }),
  bumpRefresh: () => set((state) => ({ refreshTick: state.refreshTick + 1 })),
  reset: () =>
    set({
      status: "disconnected",
      accountEmail: null,
      calendars: [],
      events: [],
      lastSyncAtMs: null,
      syncing: false,
      refreshTick: 0,
    }),
}));
