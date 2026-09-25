import type { GcalEvent } from "./GcalTypes";

export type GcalCategory = "event" | "meeting" | "task";
export type GcalCategoryFilter = "all" | GcalCategory;

const CATEGORY_KEY = "coveCategory";
const TASK_COMPLETED_KEY = "coveTaskCompleted";

export const getGcalCategory = (event: GcalEvent): GcalCategory => {
  const value = event.extendedProperties?.private?.[CATEGORY_KEY];
  return value === "meeting" || value === "task" ? value : "event";
};

export const withGcalCategory = <T extends GcalEvent>(event: T, category: GcalCategory): T => ({
  ...event,
  extendedProperties: {
    ...event.extendedProperties,
    private: {
      ...event.extendedProperties?.private,
      cove: "1",
      [CATEGORY_KEY]: category,
    },
  },
});

export const isGcalTaskCompleted = (event: GcalEvent): boolean =>
  event.extendedProperties?.private?.[TASK_COMPLETED_KEY] === "1";

export const withGcalTaskCompleted = <T extends GcalEvent>(event: T, completed: boolean): T => ({
  ...event,
  extendedProperties: {
    ...event.extendedProperties,
    private: {
      ...event.extendedProperties?.private,
      cove: "1",
      [CATEGORY_KEY]: "task",
      [TASK_COMPLETED_KEY]: completed ? "1" : "0",
    },
  },
});
