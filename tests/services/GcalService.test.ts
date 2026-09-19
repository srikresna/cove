import { beforeEach, describe, expect, it, vi } from "vitest";
import { setGcalClientCredentials } from "@/config/gcal";
import type { EncryptedPayload } from "@/domain/EncryptedPayload";
import { GCAL_SCOPE } from "@/domain/gcal/GcalTypes";
import type { IGcalRepository } from "@/repositories/IGcalRepository";
import { GcalReauthError, GcalService } from "@/services/gcal/GcalService";
import type { CryptoVault } from "@/services/vault/CryptoVault";
import { useGcalStore } from "@/store/useGcalStore";

const invoke = vi.fn();
vi.mock("@tauri-apps/api/core", () => ({ invoke: (...args: unknown[]) => invoke(...args) }));

function makeCrypto(): Pick<CryptoVault, "encryptBlob" | "decryptBlob"> {
  return {
    encryptBlob: async (bytes: Uint8Array) =>
      `enc:${btoa(String.fromCharCode(...bytes))}` as EncryptedPayload,
    decryptBlob: async (payload: EncryptedPayload) => {
      const raw = String(payload).replace(/^enc:/, "");
      return new Uint8Array([...atob(raw)].map((ch) => ch.charCodeAt(0)));
    },
  };
}

function makeRepo(): IGcalRepository {
  return {
    getTokenPayload: vi.fn().mockResolvedValue(null),
    putTokenPayload: vi.fn().mockResolvedValue(undefined),
    clearToken: vi.fn().mockResolvedValue(undefined),
    listEventsBetween: vi.fn().mockResolvedValue([]),
    replaceWindow: vi.fn().mockResolvedValue(undefined),
    upsertEvent: vi.fn().mockResolvedValue(undefined),
    deleteEvent: vi.fn().mockResolvedValue(undefined),
    clearEvents: vi.fn().mockResolvedValue(undefined),
  };
}

describe("GcalService", () => {
  let repo: IGcalRepository;
  let service: GcalService;

  beforeEach(() => {
    vi.clearAllMocks();
    setGcalClientCredentials("cid", "cs");
    useGcalStore.getState().reset();
    repo = makeRepo();
    service = new GcalService({ repo, crypto: makeCrypto() as unknown as CryptoVault });
  });

  it("connect stores an encrypted token blob and derives the account email from the primary calendar", async () => {
    invoke.mockImplementation((cmd: string) => {
      if (cmd === "gcal_connect") {
        return {
          refreshToken: "r1",
          accessToken: "a1",
          expiresAtMs: Date.now() + 3_600_000,
          scope: GCAL_SCOPE,
        };
      }
      if (cmd === "gcal_list_calendars") {
        return [
          { id: "secondary@group.calendar.google.com", summary: "Secondary", primary: false },
          { id: "me@gmail.com", summary: "me@gmail.com", primary: true },
        ];
      }
      return undefined;
    });

    await service.connect();

    expect(useGcalStore.getState().status).toBe("connected");
    expect(useGcalStore.getState().accountEmail).toBe("me@gmail.com");
    expect(repo.putTokenPayload).toHaveBeenCalledTimes(1);
    expect(service.isConnected()).toBe(true);

    const persisted = String(vi.mocked(repo.putTokenPayload).mock.calls[0]?.[0]).replace(
      /^enc:/,
      "",
    );
    const blob = JSON.parse(atob(persisted));
    expect(blob.clientId).toBe("cid");
    expect(blob.clientSecret).toBe("cs");
  });

  it("upgrades a legacy token blob with credentials from settings on first refresh", async () => {
    invoke.mockImplementation((cmd: string) => {
      if (cmd === "gcal_refresh") {
        return { accessToken: "a2", expiresAtMs: Date.now() + 3_600_000, scope: GCAL_SCOPE };
      }
      if (cmd === "gcal_list_events") return [];
      throw new Error(`unexpected command ${cmd}`);
    });
    vi.mocked(repo.getTokenPayload).mockResolvedValue(
      "enc:eyJyZWZyZXNoVG9rZW4iOiJyMSIsInNjb3BlIjoiIiwiZW1haWwiOm51bGx9" as EncryptedPayload,
    );

    await service.syncWindow("primary", 0, 1);

    expect(invoke).toHaveBeenCalledWith(
      "gcal_refresh",
      expect.objectContaining({ clientId: "cid", clientSecret: "cs" }),
    );
    expect(repo.putTokenPayload).toHaveBeenCalledTimes(1);
  });

  it("demands reconnection when no credentials exist anywhere", async () => {
    setGcalClientCredentials("", "");
    vi.mocked(repo.getTokenPayload).mockResolvedValue(
      "enc:eyJyZWZyZXNoVG9rZW4iOiJyMSIsInNjb3BlIjoiIiwiZW1haWwiOm51bGx9" as EncryptedPayload,
    );

    await expect(service.syncWindow("primary", 0, 1)).rejects.toBeInstanceOf(GcalReauthError);
    expect(useGcalStore.getState().status).toBe("reauth");
  });

  it("rolls back to a recoverable status when a reconnect attempt fails", async () => {
    invoke.mockImplementation((cmd: string) => {
      if (cmd === "gcal_refresh") {
        throw new Error("token endpoint returned 400 Bad Request: invalid_grant");
      }
      if (cmd === "gcal_connect") {
        throw new Error("Timed out waiting for Google sign-in in the browser");
      }
      throw new Error(`unexpected command ${cmd}`);
    });
    vi.mocked(repo.getTokenPayload).mockResolvedValue(
      "enc:eyJyZWZyZXNoVG9rZW4iOiJyMSIsInNjb3BlIjoiIiwiZW1haWwiOm51bGx9" as EncryptedPayload,
    );

    await expect(service.syncWindow("primary", 0, 1)).rejects.toBeInstanceOf(GcalReauthError);
    expect(useGcalStore.getState().status).toBe("reauth");

    await expect(service.connect()).rejects.toThrow(/Timed out/);
    expect(useGcalStore.getState().status).toBe("reauth");
  });

  it("lands on disconnected when a first-ever connect fails", async () => {
    invoke.mockRejectedValue(new Error("Timed out waiting for Google sign-in in the browser"));

    await expect(service.connect()).rejects.toThrow(/Timed out/);
    expect(useGcalStore.getState().status).toBe("disconnected");
  });

  it("connect succeeds even when calendar metadata is not readable with the events scope", async () => {
    invoke.mockImplementation((cmd: string) => {
      if (cmd === "gcal_connect") {
        return {
          refreshToken: "r1",
          accessToken: "a1",
          expiresAtMs: Date.now() + 3_600_000,
          scope: GCAL_SCOPE,
        };
      }
      if (cmd === "gcal_list_calendars") {
        throw new Error("Google API 403 Forbidden on GET /users/me/calendarList");
      }
      return undefined;
    });

    await service.connect();

    expect(useGcalStore.getState().status).toBe("connected");
    expect(useGcalStore.getState().accountEmail).toBeNull();
    expect(useGcalStore.getState().wideScopeMissing).toBe(true);
    expect(repo.putTokenPayload).toHaveBeenCalledTimes(1);
  });

  it("updates an event through the patch endpoint and refreshes the cache", async () => {
    vi.mocked(repo.getTokenPayload).mockResolvedValue(
      "enc:eyJyZWZyZXNoVG9rZW4iOiJyMSIsInNjb3BlIjoiIiwiZW1haWwiOm51bGx9" as EncryptedPayload,
    );
    invoke.mockImplementation((cmd: string) => {
      if (cmd === "gcal_refresh") {
        return { accessToken: "a2", expiresAtMs: Date.now() + 3_600_000, scope: GCAL_SCOPE };
      }
      if (cmd === "gcal_update_event") {
        return {
          id: "evt-1",
          summary: "Renamed",
          start: { dateTime: "2026-09-14T09:00:00.000Z" },
          end: { dateTime: "2026-09-14T10:00:00.000Z" },
        };
      }
      throw new Error(`unexpected command ${cmd}`);
    });

    await service.updateEvent("primary", "evt-1", {
      summary: "Renamed",
      start: { dateTime: "2026-09-14T09:00:00.000Z" },
      end: { dateTime: "2026-09-14T10:00:00.000Z" },
    });

    expect(invoke).toHaveBeenCalledWith(
      "gcal_update_event",
      expect.objectContaining({ calendarId: "primary", eventId: "evt-1" }),
    );
    expect(repo.upsertEvent).toHaveBeenCalledWith(
      expect.objectContaining({ id: "evt-1", calendarId: "primary" }),
    );
    expect(useGcalStore.getState().refreshTick).toBe(1);
  });

  it("rejects a read-only grant and marks reconnect needed", async () => {
    invoke.mockResolvedValue({
      refreshToken: "r1",
      accessToken: "a1",
      expiresAtMs: Date.now() + 3_600_000,
      scope: "https://www.googleapis.com/auth/calendar.events.readonly",
    });

    await expect(service.connect()).rejects.toBeInstanceOf(GcalReauthError);
    expect(useGcalStore.getState().status).toBe("reauth");
    expect(repo.putTokenPayload).not.toHaveBeenCalled();
  });

  it("refreshes an expired access token once and caches it", async () => {
    invoke.mockImplementation((cmd: string, args: Record<string, string>) => {
      if (cmd === "gcal_refresh") {
        expect(args.refreshToken).toBe("r1");
        return { accessToken: "a2", expiresAtMs: Date.now() + 3_600_000, scope: GCAL_SCOPE };
      }
      if (cmd === "gcal_list_events") return [];
      throw new Error(`unexpected command ${cmd}`);
    });

    vi.mocked(repo.getTokenPayload).mockResolvedValue(
      "enc:eyJyZWZyZXNoVG9rZW4iOiJyMSIsInNjb3BlIjoiIiwiZW1haWwiOm51bGx9" as EncryptedPayload,
    );

    await service.syncWindow("primary", 0, 1);
    expect(invoke).toHaveBeenCalledWith("gcal_refresh", expect.anything());
    expect(invoke).toHaveBeenCalledWith(
      "gcal_list_events",
      expect.objectContaining({ calendarId: "primary" }),
    );

    invoke.mockClear();
    vi.mocked(repo.replaceWindow).mockClear();
    await service.syncWindow("primary", 0, 1);
    expect(invoke).not.toHaveBeenCalledWith("gcal_refresh", expect.anything());
  });

  it("surfaces invalid_grant as a reconnect-needed error", async () => {
    invoke.mockImplementation((cmd: string) => {
      if (cmd === "gcal_refresh") {
        throw new Error("token endpoint returned 400 Bad Request: invalid_grant");
      }
      throw new Error(`unexpected command ${cmd}`);
    });
    vi.mocked(repo.getTokenPayload).mockResolvedValue(
      "enc:eyJyZWZyZXNoVG9rZW4iOiJyMSIsInNjb3BlIjoiIiwiZW1haWwiOm51bGx9" as EncryptedPayload,
    );

    await expect(service.syncWindow("primary", 0, 1)).rejects.toBeInstanceOf(GcalReauthError);
    expect(useGcalStore.getState().status).toBe("reauth");
  });

  it("caches created events and bumps the panel refresh signal", async () => {
    vi.mocked(repo.getTokenPayload).mockResolvedValue(
      "enc:eyJyZWZyZXNoVG9rZW4iOiJyMSIsInNjb3BlIjoiIiwiZW1haWwiOm51bGx9" as EncryptedPayload,
    );
    invoke.mockImplementation((cmd: string) => {
      if (cmd === "gcal_refresh") {
        return { accessToken: "a2", expiresAtMs: Date.now() + 3_600_000, scope: GCAL_SCOPE };
      }
      return {
        id: "evt-1",
        summary: "Standup",
        start: { dateTime: "2026-09-14T09:00:00.000Z" },
        end: { dateTime: "2026-09-14T10:00:00.000Z" },
        extendedProperties: { private: { cove: "1" } },
      };
    });

    const created = await service.createEvent("primary", {
      id: "evt-1",
      summary: "Standup",
      start: { dateTime: "2026-09-14T09:00:00.000Z" },
      end: { dateTime: "2026-09-14T10:00:00.000Z" },
    });

    expect(created.id).toBe("evt-1");
    expect(repo.upsertEvent).toHaveBeenCalledWith(
      expect.objectContaining({ id: "evt-1", calendarId: "primary" }),
    );
    expect(useGcalStore.getState().refreshTick).toBe(1);
  });

  it("disconnect wipes the token, the cached events, and in-memory state", async () => {
    vi.mocked(repo.getTokenPayload).mockResolvedValue(
      "enc:eyJyZWZyZXNoVG9rZW4iOiJyMSIsInNjb3BlIjoiIiwiZW1haWwiOm51bGx9" as EncryptedPayload,
    );
    invoke.mockImplementation((cmd: string) => {
      if (cmd === "gcal_refresh") {
        return { accessToken: "a2", expiresAtMs: Date.now() + 3_600_000, scope: GCAL_SCOPE };
      }
      return {
        id: "evt-1",
        summary: "x",
        start: { dateTime: "2026-09-14T09:00:00.000Z" },
        end: { dateTime: "2026-09-14T10:00:00.000Z" },
      };
    });
    await service.createEvent("primary", {
      id: "evt-1",
      summary: "x",
      start: { dateTime: "2026-09-14T09:00:00.000Z" },
      end: { dateTime: "2026-09-14T10:00:00.000Z" },
    });

    await service.disconnect();

    expect(repo.clearToken).toHaveBeenCalled();
    expect(repo.clearEvents).toHaveBeenCalled();
    expect(service.isConnected()).toBe(false);
    expect(useGcalStore.getState().status).toBe("disconnected");
  });
});
