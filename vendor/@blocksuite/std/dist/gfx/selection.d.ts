import { DisposableGroup } from '@blocksuite/global/disposable';
import { type IPoint } from '@blocksuite/global/gfx';
import { Subject } from 'rxjs';
import { CursorSelection, SurfaceSelection } from '../selection/index.js';
import type { GfxController } from './controller.js';
import { GfxExtension } from './extension.js';
import type { GfxModel } from './model/model.js';
import { GfxGroupLikeElementModel } from './model/surface/element-model.js';
export interface SurfaceSelectionState {
    /**
     * The selected elements. Could be blocks or canvas elements
     */
    elements: string[];
    /**
     * Indicate whether the selected element is in editing mode
     */
    editing?: boolean;
    /**
     *  Cannot be operated, only box is displayed
     */
    inoperable?: boolean;
}
/**
 * GfxSelectionManager is just a wrapper of std selection providing
 * convenient method and states in gfx
 */
export declare class GfxSelectionManager extends GfxExtension {
    static key: string;
    private _activeGroup;
    private _cursorSelection;
    private _lastSurfaceSelections;
    private _remoteCursorSelectionMap;
    private _remoteSelectedSet;
    private _remoteSurfaceSelectionsMap;
    private _selectedSet;
    private _surfaceSelections;
    disposable: DisposableGroup;
    readonly slots: {
        updated: Subject<SurfaceSelection[]>;
        remoteUpdated: Subject<void>;
        cursorUpdated: Subject<CursorSelection>;
        remoteCursorUpdated: Subject<void>;
    };
    get activeGroup(): GfxGroupLikeElementModel<import("./index.js").BaseElementProps> | null;
    get cursorSelection(): CursorSelection | null;
    get editing(): boolean;
    get empty(): boolean;
    get firstElement(): GfxModel;
    get inoperable(): boolean;
    get lastSurfaceSelections(): SurfaceSelection[];
    get remoteCursorSelectionMap(): Map<number, CursorSelection>;
    get remoteSelectedSet(): Set<string>;
    get remoteSurfaceSelectionsMap(): Map<number, SurfaceSelection[]>;
    get selectedBound(): import("@blocksuite/global/gfx").Bound;
    get selectedElements(): GfxModel[];
    get selectedIds(): string[];
    get selectedSet(): Set<string>;
    get stdSelection(): import("@blocksuite/store").StoreSelectionExtension;
    get surfaceModel(): import("./index.js").SurfaceBlockModel | null;
    get surfaceSelections(): SurfaceSelection[];
    static extendGfx(gfx: GfxController): void;
    clear(): void;
    clearLast(): void;
    equals(selection: SurfaceSelection[]): boolean;
    /**
     * check if the element is selected in local
     * @param element
     */
    has(element: string): boolean;
    /**
     * check if element is selected by remote peers
     * @param element
     */
    hasRemote(element: string): boolean;
    isEmpty(selections: SurfaceSelection[]): boolean;
    isInSelectedRect(modelX: number, modelY: number): boolean;
    mounted(): void;
    set(selection: SurfaceSelectionState | SurfaceSelection[]): void;
    /**
     * Toggle the selection state of single element
     * @param element
     * @returns
     */
    toggle(element: GfxModel | string): void;
    setCursor(cursor: CursorSelection | IPoint): void;
    unmounted(): void;
}
declare module './controller.js' {
    interface GfxController {
        readonly selection: GfxSelectionManager;
    }
}
//# sourceMappingURL=selection.d.ts.map