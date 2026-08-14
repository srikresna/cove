import { proxies } from "./memory";
export function stashProp(yAbstract, prop) {
  const proxy = proxies.get(yAbstract);
  proxy?.stash(prop);
}
export function popProp(yAbstract, prop) {
  const proxy = proxies.get(yAbstract);
  proxy?.pop(prop);
}
