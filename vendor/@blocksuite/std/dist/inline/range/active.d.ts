export declare function isRangeSyncExcludedTarget(target: EventTarget | null): boolean;
export declare function shouldDeactivateEditorOnFocusOut(editorHost: HTMLElement, relatedTarget: EventTarget | null): boolean;
/**
 * Check if the active element is in the editor host.
 * TODO(@mirone): this is a trade-off, we need to use separate awareness store for every store to make sure the selection is isolated.
 *
 * @param editorHost - The editor host element.
 * @returns Whether the active element is in the editor host.
 */
export declare function isActiveInEditor(editorHost: HTMLElement): boolean;
//# sourceMappingURL=active.d.ts.map