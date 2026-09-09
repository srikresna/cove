import { create } from "zustand";
import { customIconService } from "../di/container";
import { processWorkspaceIcon } from "../utils/workspaceIcon";
import { notifyError } from "./notify";

export interface CustomIconEntry {
  name: string;
  dataUrl: string;
}

interface CustomIconState {
  icons: Record<string, CustomIconEntry>;
  fetchCustomIcons: () => Promise<void>;
  addCustomIcon: (file: File) => Promise<void>;
  removeCustomIcon: (id: string) => Promise<boolean>;
}

export const useCustomIconStore = create<CustomIconState>((set) => ({
  icons: {},

  fetchCustomIcons: async () => {
    try {
      const icons = await customIconService.list();
      set({
        icons: Object.fromEntries(
          icons.map((icon) => [icon.id, { name: icon.name, dataUrl: icon.dataUrl }]),
        ),
      });
    } catch (err) {
      notifyError(err);
    }
  },

  addCustomIcon: async (file) => {
    try {
      const dataUrl = await processWorkspaceIcon(file);
      const name = file.name.replace(/\.[^.]+$/, "") || "Custom icon";
      const added = await customIconService.add(name, dataUrl);
      set((state) => ({
        icons: { ...state.icons, [added.id]: { name: added.name, dataUrl: added.dataUrl } },
      }));
    } catch (err) {
      notifyError(err);
    }
  },

  removeCustomIcon: async (id) => {
    try {
      await customIconService.remove(id);
      set((state) => {
        const icons = { ...state.icons };
        delete icons[id];
        return { icons };
      });
      return true;
    } catch (err) {
      notifyError(err);
      return false;
    }
  },
}));
