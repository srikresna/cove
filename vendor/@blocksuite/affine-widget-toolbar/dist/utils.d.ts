import { type EditorToolbar } from '@blocksuite/affine-components/toolbar';
import { type ToolbarActions, type ToolbarContext, type ToolbarPlacement } from '@blocksuite/affine-shared/services';
import type { AutoUpdateOptions, ReferenceElement, SideObject } from '@floating-ui/dom';
export declare const sideMap: Map<string, {
    top: number;
    bottom?: undefined;
} | {
    top: number;
    bottom: number;
}>;
export declare function autoUpdatePosition(signal: AbortSignal, toolbar: EditorToolbar, referenceElement: ReferenceElement, flavour: string, placement: ToolbarPlacement, sideOptions: Partial<SideObject> | null, options?: AutoUpdateOptions): () => void;
export declare function combine(actions: ToolbarActions, context: ToolbarContext): any[];
/**
 * Renders toolbar
 *
 * Merges the following configs:
 * 1. `affine:note`
 * 2. `custom:affine:note`
 * 3. `affine:*`
 * 4. `custom:affine:*`
 */
export declare function renderToolbar(toolbar: EditorToolbar, context: ToolbarContext, flavour: string): void;
//# sourceMappingURL=utils.d.ts.map