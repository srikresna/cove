import { SYS_KEYS } from "../../consts";
import { Boxed } from "../boxed";
import { Text } from "../text";
export const keyWithoutPrefix = (key) => key.replace(/(prop|sys):/, "");
export const keyWithPrefix = (key) => (SYS_KEYS.has(key) ? `sys:${key}` : `prop:${key}`);
const proxySymbol = Symbol("proxy");
export function isProxy(value) {
  return proxySymbol in Object.getPrototypeOf(value);
}
export function markProxy(value) {
  Object.setPrototypeOf(value, {
    [proxySymbol]: true,
  });
  return value;
}
export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}
export function deleteEmptyObject(obj, key, parent) {
  if (isEmptyObject(obj)) {
    delete parent[key];
  }
}
export function getFirstKey(key) {
  const result = key.split(".").at(0);
  if (!result) {
    throw new Error(`Invalid key for: ${key}`);
  }
  return result;
}
export function bindOnChangeIfNeed(value, onChange) {
  if (value instanceof Text || Boxed.is(value)) {
    value.bind(onChange);
  }
}
