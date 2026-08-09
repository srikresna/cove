/**
 * Shared utility for managing table group collapsed state in sessionStorage.
 * Used by both PC and mobile table group implementations.
 */
/**
 * Gets the collapsed state for a specific table group from sessionStorage.
 * @param viewId - The ID of the table view
 * @param groupKey - The key of the group
 * @returns The collapsed state as a boolean, or false if not found or invalid
 */
export declare function getCollapsedState(viewId: string, groupKey: string): boolean;
/**
 * Sets the collapsed state for a specific table group in sessionStorage.
 * @param viewId - The ID of the table view
 * @param groupKey - The key of the group
 * @param collapsed - The collapsed state to store
 */
export declare function setCollapsedState(viewId: string, groupKey: string, collapsed: boolean): void;
//# sourceMappingURL=collapsed-state.d.ts.map