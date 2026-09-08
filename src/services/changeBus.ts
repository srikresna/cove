export type ChangeTopic = "properties" | "tags";

type Listener = () => void;

const listeners = new Map<ChangeTopic, Set<Listener>>();

export const changeBus = {
  on(topic: ChangeTopic, listener: Listener): () => void {
    const set = listeners.get(topic) ?? new Set<Listener>();
    set.add(listener);
    listeners.set(topic, set);
    return () => set.delete(listener);
  },

  emit(topic: ChangeTopic): void {
    for (const listener of [...(listeners.get(topic) ?? [])]) {
      listener();
    }
  },
};

export function publishingWrites<T extends object>(
  repo: T,
  writeMethods: string[],
  topic: ChangeTopic,
): T {
  const wrapper: Record<string, unknown> = {};
  for (const name of writeMethods) {
    const orig = (repo as unknown as Record<string, unknown>)[name];
    if (typeof orig !== "function") continue;
    wrapper[name] = async function (this: T, ...args: unknown[]) {
      const result = await (orig as (...a: unknown[]) => unknown).apply(repo, args);
      changeBus.emit(topic);
      return result;
    };
  }
  return new Proxy(repo, {
    get(target, prop) {
      if (typeof prop === "string" && prop in wrapper) return wrapper[prop];
      const value = Reflect.get(target, prop) as unknown;
      return typeof value === "function"
        ? (value as (...a: unknown[]) => unknown).bind(target)
        : value;
    },
  });
}
