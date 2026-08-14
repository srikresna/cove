import { ZERO_WIDTH_FOR_EMPTY_LINE } from "../consts.js";
export function calculateTextLength(text) {
  if (text.wholeText === ZERO_WIDTH_FOR_EMPTY_LINE) {
    return 0;
  } else {
    return text.wholeText.length;
  }
}
const inlineRootTextCaches = new WeakMap();
const buildInlineRootTextCache = (rootElement, cache) => {
  const textSpanElements = Array.from(rootElement.querySelectorAll('[data-v-text="true"]'));
  const textNodes = [];
  const textNodeIndexMap = new WeakMap();
  const prefixLengths = [];
  let prefixLength = 0;
  for (const textSpanElement of textSpanElements) {
    const textNode = Array.from(textSpanElement.childNodes).find((node) => node instanceof Text);
    if (!textNode) continue;
    prefixLengths.push(prefixLength);
    textNodeIndexMap.set(textNode, textNodes.length);
    textNodes.push(textNode);
    prefixLength += calculateTextLength(textNode);
  }
  const lineIndexMap = new WeakMap();
  const lineElements = Array.from(rootElement.querySelectorAll("v-line"));
  for (const [index, line] of lineElements.entries()) {
    lineIndexMap.set(line, index);
  }
  cache.textNodes = textNodes;
  cache.textNodeIndexMap = textNodeIndexMap;
  cache.prefixLengths = prefixLengths;
  cache.lineIndexMap = lineIndexMap;
  cache.dirty = false;
};
export function invalidateInlineRootTextCache(rootElement) {
  const cache = inlineRootTextCaches.get(rootElement);
  if (cache) {
    cache.dirty = true;
  }
}
export function getInlineRootTextCache(rootElement) {
  let cache = inlineRootTextCaches.get(rootElement);
  if (!cache) {
    cache = {
      dirty: true,
      observer: null,
      textNodes: [],
      textNodeIndexMap: new WeakMap(),
      prefixLengths: [],
      lineIndexMap: new WeakMap(),
    };
    inlineRootTextCaches.set(rootElement, cache);
  }
  if (!cache.observer && typeof MutationObserver !== "undefined") {
    cache.observer = new MutationObserver(() => {
      cache.dirty = true;
    });
    cache.observer.observe(rootElement, {
      subtree: true,
      childList: true,
      characterData: true,
    });
  }
  if (cache.dirty) {
    buildInlineRootTextCache(rootElement, cache);
  }
  return cache;
}
export function getTextNodesFromElement(element) {
  const textSpanElements = Array.from(element.querySelectorAll('[data-v-text="true"]'));
  const textNodes = textSpanElements.flatMap((textSpanElement) => {
    const textNode = Array.from(textSpanElement.childNodes).find((node) => node instanceof Text);
    if (!textNode) return [];
    return textNode;
  });
  return textNodes;
}
