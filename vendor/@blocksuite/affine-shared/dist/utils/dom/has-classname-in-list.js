/**
 * Return `true` if the element has class name in the class list.
 */
export function hasClassNameInList(element, classList) {
    return classList.some(className => element.classList.contains(className));
}
