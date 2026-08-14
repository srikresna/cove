import { isPureObject } from "../is-pure-object";
import { native2Y } from "../native-y";
import { bindOnChangeIfNeed, getFirstKey, keyWithoutPrefix, keyWithPrefix } from "./utils";
export function yMapUpdater({ shouldByPassYjs, yMap, initialized, onChange, fullPath, value }) {
  const firstKey = getFirstKey(fullPath);
  if (shouldByPassYjs()) {
    return;
  }
  const list = [];
  yMap.forEach((_, key) => {
    if (initialized() && keyWithoutPrefix(key).startsWith(fullPath)) {
      yMap.delete(key);
    }
  });
  const run = (obj, basePath) => {
    Object.entries(obj).forEach(([key, value]) => {
      const fullPath = basePath ? `${basePath}.${key}` : key;
      if (isPureObject(value)) {
        run(value, fullPath);
      } else {
        list.push(() => {
          bindOnChangeIfNeed(value, () => {
            onChange?.(firstKey, true);
          });
          yMap.set(keyWithPrefix(fullPath), native2Y(value));
        });
      }
    });
  };
  run(value, fullPath);
  if (list.length && initialized()) {
    yMap.doc?.transact(
      () => {
        list.forEach((fn) => fn());
      },
      { proxy: true },
    );
  }
}
