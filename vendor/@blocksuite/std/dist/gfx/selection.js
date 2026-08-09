import { DisposableGroup } from '@blocksuite/global/disposable';
import { getCommonBoundWithRotation, } from '@blocksuite/global/gfx';
import { assertType } from '@blocksuite/global/utils';
import groupBy from 'lodash-es/groupBy';
import { Subject } from 'rxjs';
import { BlockSelection, CursorSelection, SurfaceSelection, TextSelection, } from '../selection/index.js';
import { GfxExtension, GfxExtensionIdentifier } from './extension.js';
import { GfxGroupLikeElementModel } from './model/surface/element-model.js';
/**
 * GfxSelectionManager is just a wrapper of std selection providing
 * convenient method and states in gfx
 */
export class GfxSelectionManager extends GfxExtension {
    constructor() {
        super(...arguments);
        this._activeGroup = null;
        this._cursorSelection = null;
        this._lastSurfaceSelections = [];
        this._remoteCursorSelectionMap = new Map();
        this._remoteSelectedSet = new Set();
        this._remoteSurfaceSelectionsMap = new Map();
        this._selectedSet = new Set();
        this._surfaceSelections = [];
        this.disposable = new DisposableGroup();
        this.slots = {
            updated: new Subject(),
            remoteUpdated: new Subject(),
            cursorUpdated: new Subject(),
            remoteCursorUpdated: new Subject(),
        };
    }
    static { this.key = 'gfxSelection'; }
    get activeGroup() {
        return this._activeGroup;
    }
    get cursorSelection() {
        return this._cursorSelection;
    }
    get editing() {
        return this.surfaceSelections.some(sel => sel.editing);
    }
    get empty() {
        return this.surfaceSelections.every(sel => sel.elements.length === 0);
    }
    get firstElement() {
        return this.selectedElements[0];
    }
    get inoperable() {
        return this.surfaceSelections.some(sel => sel.inoperable);
    }
    get lastSurfaceSelections() {
        return this._lastSurfaceSelections;
    }
    get remoteCursorSelectionMap() {
        return this._remoteCursorSelectionMap;
    }
    get remoteSelectedSet() {
        return this._remoteSelectedSet;
    }
    get remoteSurfaceSelectionsMap() {
        return this._remoteSurfaceSelectionsMap;
    }
    get selectedBound() {
        return getCommonBoundWithRotation(this.selectedElements);
    }
    get selectedElements() {
        const elements = [];
        this.selectedIds.forEach(id => {
            const el = this.gfx.getElementById(id);
            el && elements.push(el);
        });
        return elements;
    }
    get selectedIds() {
        return [...this._selectedSet];
    }
    get selectedSet() {
        return this._selectedSet;
    }
    get stdSelection() {
        return this.std.selection;
    }
    get surfaceModel() {
        return this.gfx.surface;
    }
    get surfaceSelections() {
        return this._surfaceSelections;
    }
    static extendGfx(gfx) {
        Object.defineProperty(gfx, 'selection', {
            get() {
                return this.std.get(GfxExtensionIdentifier('gfxSelection'));
            },
        });
    }
    clear() {
        this.stdSelection.clear();
        this.set({
            elements: [],
            editing: false,
        });
    }
    clearLast() {
        this._lastSurfaceSelections = [];
    }
    equals(selection) {
        let count = 0;
        let editing = false;
        const exist = selection.every(sel => {
            const exist = sel.elements.every(id => this._selectedSet.has(id));
            if (exist) {
                count += sel.elements.length;
            }
            if (sel.editing)
                editing = true;
            return exist;
        });
        return (exist && count === this._selectedSet.size && editing === this.editing);
    }
    /**
     * check if the element is selected in local
     * @param element
     */
    has(element) {
        return this._selectedSet.has(element);
    }
    /**
     * check if element is selected by remote peers
     * @param element
     */
    hasRemote(element) {
        return this._remoteSelectedSet.has(element);
    }
    isEmpty(selections) {
        return selections.every(sel => sel.elements.length === 0);
    }
    isInSelectedRect(modelX, modelY) {
        const selected = this.selectedElements;
        if (!selected.length)
            return false;
        const commonBound = getCommonBoundWithRotation(selected);
        if (commonBound && commonBound.isPointInBound([modelX, modelY])) {
            return true;
        }
        return false;
    }
    mounted() {
        this.disposable.add(this.stdSelection.slots.changed.subscribe(selections => {
            const { cursor = [], surface = [] } = groupBy(selections, sel => {
                if (sel.is(SurfaceSelection)) {
                    return 'surface';
                }
                else if (sel.is(CursorSelection)) {
                    return 'cursor';
                }
                return 'none';
            });
            assertType(cursor);
            assertType(surface);
            if (cursor[0] && !this.cursorSelection?.equals(cursor[0])) {
                this._cursorSelection = cursor[0];
                this.slots.cursorUpdated.next(cursor[0]);
            }
            if ((surface.length === 0 && this.empty) || this.equals(surface)) {
                return;
            }
            this._lastSurfaceSelections = this.surfaceSelections;
            this._surfaceSelections = surface;
            this._selectedSet = new Set();
            surface.forEach(sel => sel.elements.forEach(id => {
                this._selectedSet.add(id);
            }));
            this.slots.updated.next(this.surfaceSelections);
        }));
        this.disposable.add(this.stdSelection.slots.remoteChanged.subscribe(states => {
            const surfaceMap = new Map();
            const cursorMap = new Map();
            const selectedSet = new Set();
            states.forEach((selections, id) => {
                let hasTextSelection = false;
                let hasBlockSelection = false;
                selections.forEach(selection => {
                    if (selection.is(TextSelection)) {
                        hasTextSelection = true;
                    }
                    if (selection.is(BlockSelection)) {
                        hasBlockSelection = true;
                    }
                    if (selection.is(SurfaceSelection)) {
                        const surfaceSelections = surfaceMap.get(id) ?? [];
                        surfaceSelections.push(selection);
                        surfaceMap.set(id, surfaceSelections);
                        selection.elements.forEach(id => selectedSet.add(id));
                    }
                    if (selection.is(CursorSelection)) {
                        cursorMap.set(id, selection);
                    }
                });
                if (hasBlockSelection || hasTextSelection) {
                    surfaceMap.delete(id);
                }
                if (hasTextSelection) {
                    cursorMap.delete(id);
                }
            });
            this._remoteCursorSelectionMap = cursorMap;
            this._remoteSurfaceSelectionsMap = surfaceMap;
            this._remoteSelectedSet = selectedSet;
            this.slots.remoteUpdated.next();
            this.slots.remoteCursorUpdated.next();
        }));
    }
    set(selection) {
        if (Array.isArray(selection)) {
            this.stdSelection.setGroup('gfx', this.cursorSelection ? [...selection, this.cursorSelection] : selection);
            return;
        }
        const { blocks = [], elements = [] } = groupBy(selection.elements, id => {
            return this.std.store.hasBlock(id) ? 'blocks' : 'elements';
        });
        let instances = [];
        if (elements.length > 0 && this.surfaceModel) {
            instances.push(this.stdSelection.create(SurfaceSelection, this.surfaceModel.id, elements, selection.editing ?? false, selection.inoperable));
        }
        if (blocks.length > 0) {
            instances = instances.concat(blocks.map(blockId => this.stdSelection.create(SurfaceSelection, blockId, [blockId], selection.editing ?? false, selection.inoperable)));
        }
        this.stdSelection.setGroup('gfx', this.cursorSelection
            ? instances.concat([this.cursorSelection])
            : instances);
        if (instances.length > 0) {
            this.stdSelection.setGroup('note', []);
        }
        if (selection.elements.length === 1 &&
            this.firstElement instanceof GfxGroupLikeElementModel) {
            this._activeGroup = this.firstElement;
        }
        else {
            if (this.selectedElements.some(ele => ele.group !== this._activeGroup) ||
                this.selectedElements.length === 0) {
                this._activeGroup = null;
            }
        }
    }
    /**
     * Toggle the selection state of single element
     * @param element
     * @returns
     */
    toggle(element) {
        element = typeof element === 'string' ? element : element.id;
        this.set({
            elements: this.has(element)
                ? this.selectedIds.filter(id => id !== element)
                : [...this.selectedIds, element],
        });
    }
    setCursor(cursor) {
        const instance = this.stdSelection.create(CursorSelection, cursor.x, cursor.y);
        this.stdSelection.setGroup('gfx', [...this.surfaceSelections, instance]);
    }
    unmounted() {
        this.disposable.dispose();
    }
}
