import { beforeEach, describe, expect, it, vi } from "vitest";

const { invoke } = vi.hoisted(() => ({
  invoke: vi.fn<(cmd: string, args?: unknown) => Promise<unknown>>(),
}));

vi.mock("@tauri-apps/api/core", () => ({ invoke }));

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
  save: vi.fn(),
}));

import { TauriBackupService } from "@/services/vault/backup";

function makeService(shouldFailSuspend = false) {
  const order: string[] = [];
  const db = {
    suspend: vi.fn(async () => {
      if (shouldFailSuspend) throw new Error("close failed");
      order.push("suspend");
    }),
    resume: vi.fn(() => order.push("resume")),
  };
  return { service: new TauriBackupService(db), order, db };
}

describe("TauriBackupService restore paths", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("restoreFromFile suspends before invoking and resumes afterwards", async () => {
    const { service, order } = makeService();
    invoke.mockResolvedValue(undefined);

    await service.restoreFromFile("C:/backups/cove.db");

    expect(order).toEqual(["suspend", "resume"]);
    expect(invoke).toHaveBeenCalledWith("restore_database", { sourcePath: "C:/backups/cove.db" });
  });

  it("restoreFromFile still resumes when the restore fails", async () => {
    const { service, order } = makeService();
    invoke.mockRejectedValue(new Error("restore failed"));

    await expect(service.restoreFromFile("C:/x.db")).rejects.toThrow("restore failed");
    expect(order).toEqual(["suspend", "resume"]);
  });

  it("rollbackPreRestore returns false when no pre-restore file exists", async () => {
    const { service, order } = makeService();
    invoke.mockResolvedValue(null);

    await expect(service.rollbackPreRestore()).resolves.toBe(false);
    expect(order).toEqual([]);
    expect(invoke).not.toHaveBeenCalledWith("restore_database", expect.anything());
  });

  it("rollbackPreRestore suspends the database before restoring (WAL lock guard)", async () => {
    const { service, order } = makeService();
    invoke.mockImplementation(async (cmd: string) => {
      if (cmd === "pre_restore_backup_path") return "C:/data/cove.db.pre-restore";
      return undefined;
    });

    await expect(service.rollbackPreRestore()).resolves.toBe(true);

    expect(order).toEqual(["suspend", "resume"]);
    expect(invoke).toHaveBeenCalledWith("restore_database", {
      sourcePath: "C:/data/cove.db.pre-restore",
    });
  });

  it("rollbackPreRestore resumes when the restore fails", async () => {
    const { service, order } = makeService();
    invoke.mockImplementation(async (cmd: string) => {
      if (cmd === "pre_restore_backup_path") return "C:/data/cove.db.pre-restore";
      throw new Error("cannot remove stale cove.db-wal");
    });

    await expect(service.rollbackPreRestore()).rejects.toThrow("cove.db-wal");
    expect(order).toEqual(["suspend", "resume"]);
  });
});
