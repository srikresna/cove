import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUIStore } from "@/store/useUIStore";

describe("useUIStore", () => {
  beforeEach(() => {
    localStorage.removeItem("cove_theme");
    vi.restoreAllMocks();
    useUIStore.setState({
      isCreateModalOpen: false,
      isQuickSearchOpen: false,
      isSettingsOpen: false,
      activePage: "editor",
      pickerResolve: null,
    });
  });

  it("pickNote installs a resolver and opens quick search", async () => {
    const promise = useUIStore.getState().pickNote();

    expect(useUIStore.getState().isQuickSearchOpen).toBe(true);
    expect(useUIStore.getState().pickerResolve).not.toBeNull();

    useUIStore.getState().resolvePicker("note-9");
    await expect(promise).resolves.toBe("note-9");
    expect(useUIStore.getState().isQuickSearchOpen).toBe(false);
    expect(useUIStore.getState().pickerResolve).toBeNull();
  });

  it("resolvePicker(null) settles the picker with null and closes", async () => {
    const promise = useUIStore.getState().pickNote();

    useUIStore.getState().resolvePicker(null);

    await expect(promise).resolves.toBeNull();
    expect(useUIStore.getState().isQuickSearchOpen).toBe(false);
  });

  it("setQuickSearchOpen(false) auto-resolves a pending picker (Cmd+K close)", async () => {
    const promise = useUIStore.getState().pickNote();

    useUIStore.getState().setQuickSearchOpen(false);

    await expect(promise).resolves.toBeNull();
    expect(useUIStore.getState().pickerResolve).toBeNull();
  });

  it("setQuickSearchOpen(true) leaves the picker alone", () => {
    const resolve = vi.fn();
    useUIStore.setState({ pickerResolve: resolve });

    useUIStore.getState().setQuickSearchOpen(true);

    expect(useUIStore.getState().pickerResolve).toBe(resolve);
  });

  it("a second pickNote settles the previous picker with null", async () => {
    const first = useUIStore.getState().pickNote();
    const second = useUIStore.getState().pickNote();

    await expect(first).resolves.toBeNull();

    useUIStore.getState().resolvePicker("n2");
    await expect(second).resolves.toBe("n2");
  });

  it("toggleDarkMode flips the mode and persists it", () => {
    const initial = useUIStore.getState().isDarkMode;

    useUIStore.getState().toggleDarkMode();

    expect(useUIStore.getState().isDarkMode).toBe(!initial);
    expect(localStorage.getItem("cove_theme")).toBe(!initial ? "dark" : "light");
  });

  it("setActivePage switches pages and back to editor", () => {
    useUIStore.getState().setActivePage("library");
    expect(useUIStore.getState().activePage).toBe("library");

    useUIStore.getState().setActivePage("journals");
    expect(useUIStore.getState().activePage).toBe("journals");

    useUIStore.getState().setActivePage("editor");
    expect(useUIStore.getState().activePage).toBe("editor");
  });
});
