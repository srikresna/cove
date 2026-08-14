import { y2Native } from "../native-y";
import { deleteEmptyObject, getFirstKey, isEmptyObject, keyWithoutPrefix } from "./utils";
// update proxy when yjs map changes
export const getYEventHandler = (options) => {
  const { event } = options;
  const { keysChanged, changes } = event;
  keysChanged.forEach((key) => {
    const type = changes.keys.get(key);
    if (!type) return;
    if (type.action === "update" || type.action === "add") {
      return handleUpdateOrAdd(key, options);
    }
    if (type.action === "delete") {
      return handleDelete(key, options);
    }
  });
};
function isStashed(key, stashed) {
  const keyName = keyWithoutPrefix(key);
  const firstKey = getFirstKey(keyName);
  return stashed.has(firstKey);
}
function handleUpdateOrAdd(key, { yMap, proxy, stashed, updateWithYjsSkip, transform, onChange }) {
  if (isStashed(key, stashed)) {
    return;
  }
  const keyName = keyWithoutPrefix(key);
  const firstKey = getFirstKey(keyName);
  updateWithYjsSkip(() => {
    const value = yMap.get(key);
    const keys = keyName.split(".");
    void keys.reduce((acc, key, index, arr) => {
      if (!acc[key] && index !== arr.length - 1) {
        acc[key] = {};
      }
      if (index === arr.length - 1) {
        acc[key] = y2Native(value, {
          transform: (value, origin) => transform(firstKey, value, origin),
        });
      }
      return acc[key];
    }, proxy);
  });
  onChange?.(firstKey, false);
}
function handleDelete(key, { proxy, stashed, updateWithYjsSkip, onChange }) {
  if (isStashed(key, stashed)) {
    return;
  }
  const keyName = keyWithoutPrefix(key);
  const firstKey = getFirstKey(keyName);
  updateWithYjsSkip(() => {
    const keys = keyName.split(".");
    void keys.reduce((acc, key, index) => {
      if (index === keys.length - 1) {
        delete acc[key];
        let curr = acc;
        let parentKey = keys[index - 1];
        let parent = proxy;
        let path = keys.slice(0, -2);
        for (let i = keys.length - 2; i > 0; i--) {
          for (const pathKey of path) {
            parent = parent[pathKey];
          }
          if (!isEmptyObject(curr)) {
            break;
          }
          deleteEmptyObject(curr, parentKey, parent);
          curr = parent;
          parentKey = keys[i - 1];
          path = path.slice(0, -1);
          parent = proxy;
        }
      }
      return acc[key];
    }, proxy);
  });
  onChange?.(firstKey, false);
}
