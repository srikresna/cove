import { isGfxGroupCompatibleModel } from "../gfx/model/base.js";
/**
 * Get the top elements from the list of elements, which are in some tree structures.
 *
 * For example: a list `[G1, E1, G2, E2, E3, E4, G4, E5, E6]`,
 * and they are in the elements tree like:
 * ```
 *     G1         G4      E6
 *    /  \        |
 *  E1   G2       E5
 *       / \
 *      E2  G3*
 *         / \
 *        E3 E4
 * ```
 * where the star symbol `*` denote it is not in the list.
 *
 * The result should be `[G1, G4, E6]`
 */
export function getTopElements(elements) {
  const uniqueElements = [...new Set(elements)];
  const selected = new Set(uniqueElements);
  const topElements = [];
  for (const element of uniqueElements) {
    let ancestor = element.group;
    let hasSelectedAncestor = false;
    while (ancestor) {
      if (selected.has(ancestor)) {
        hasSelectedAncestor = true;
        break;
      }
      ancestor = ancestor.group;
    }
    if (!hasSelectedAncestor) {
      topElements.push(element);
    }
  }
  return topElements;
}
export function batchAddChildren(container, elements) {
  const uniqueElements = [...new Set(elements)];
  if (uniqueElements.length === 0) return;
  const batchContainer = container;
  if (batchContainer.addChildren) {
    batchContainer.addChildren(uniqueElements);
    return;
  }
  uniqueElements.forEach((element) => {
    container.addChild(element);
  });
}
export function batchRemoveChildren(container, elements) {
  const uniqueElements = [...new Set(elements)];
  if (uniqueElements.length === 0) return;
  const batchContainer = container;
  if (batchContainer.removeChildren) {
    batchContainer.removeChildren(uniqueElements);
    return;
  }
  uniqueElements.forEach((element) => {
    // oxlint-disable-next-line unicorn/prefer-dom-node-remove
    container.removeChild(element);
  });
}
function traverse(element, preCallback, postCallBack) {
  // avoid infinite loop caused by circular reference
  const visited = new Set();
  const innerTraverse = (element) => {
    if (visited.has(element)) return;
    visited.add(element);
    if (preCallback) {
      const interrupt = preCallback(element);
      if (interrupt) return;
    }
    if (isGfxGroupCompatibleModel(element)) {
      element.childElements.forEach((child) => {
        innerTraverse(child);
      });
    }
    if (postCallBack) {
      postCallBack(element);
    }
  };
  innerTraverse(element);
}
export function descendantElementsImpl(container) {
  const results = [];
  container.childElements.forEach((child) => {
    traverse(child, (element) => {
      results.push(element);
    });
  });
  return results;
}
export function hasDescendantElementImpl(container, element) {
  let _container = element.group;
  while (_container) {
    if (_container === container) return true;
    _container = _container.group;
  }
  return false;
}
/**
 * This checker is used to prevent circular reference, when adding a child element to a container.
 */
export function canSafeAddToContainer(container, element) {
  if (
    element === container ||
    (isGfxGroupCompatibleModel(element) && element.hasDescendant(container))
  ) {
    return false;
  }
  return true;
}
export function isLockedByAncestorImpl(element) {
  return element.groups.some(isLockedBySelfImpl);
}
export function isLockedBySelfImpl(element) {
  return element.lockedBySelf ?? false;
}
export function isLockedImpl(element) {
  return isLockedBySelfImpl(element) || isLockedByAncestorImpl(element);
}
export function lockElementImpl(doc, element) {
  doc.transact(() => {
    element.lockedBySelf = true;
  });
}
export function unlockElementImpl(doc, element) {
  doc.transact(() => {
    element.lockedBySelf = false;
  });
}
