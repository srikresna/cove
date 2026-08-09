import { DisposableGroup } from '@blocksuite/global/disposable';
import { Bound } from '@blocksuite/global/gfx';
import { assertType } from '@blocksuite/global/utils';
import { generateKeyBetween } from 'fractional-indexing';
import last from 'lodash-es/last';
import { Subject } from 'rxjs';
import { compare, getElementIndex, getLayerEndZIndex, insertToOrderedArray, isInRange, removeFromOrderedArray, SortOrder, ungroupIndex, updateLayersZIndex, } from '../utils/layer.js';
import { GfxExtension } from './extension.js';
import { isGfxGroupCompatibleModel, } from './model/base.js';
import { GfxBlockElementModel } from './model/gfx-block-model.js';
import { GfxPrimitiveElementModel } from './model/surface/element-model.js';
import { GfxLocalElementModel } from './model/surface/local-element-model.js';
import { SurfaceBlockModel } from './model/surface/surface-model.js';
export class LayerManager extends GfxExtension {
    static { this.key = 'layerManager'; }
    static { this.INITIAL_INDEX = 'a0'; }
    get _doc() {
        return this.std.store;
    }
    get _surface() {
        return this.gfx.surface;
    }
    constructor(gfx) {
        super(gfx);
        this._disposable = new DisposableGroup();
        this.blocks = [];
        this.canvasElements = [];
        this.canvasLayers = [];
        this.layers = [];
        this._groupChildSnapshot = new Map();
        this.slots = {
            layerUpdated: new Subject(),
        };
        this._reset();
    }
    _buildCanvasLayers() {
        const canvasLayers = this.layers
            .filter((layer) => layer.type === 'canvas')
            .map(layer => {
            return {
                set: layer.set,
                elements: layer.elements,
                zIndex: layer.zIndex,
                indexes: layer.indexes,
            };
        });
        if (!canvasLayers.length || last(this.layers)?.type !== 'canvas') {
            canvasLayers.push({
                set: new Set(),
                elements: [],
                zIndex: 0,
                indexes: [LayerManager.INITIAL_INDEX, LayerManager.INITIAL_INDEX],
            });
        }
        this.canvasLayers = canvasLayers;
    }
    _getModelType(element) {
        return element instanceof GfxLocalElementModel ||
            element instanceof GfxPrimitiveElementModel
            ? 'canvas'
            : 'block';
    }
    _getModelById(id) {
        if (!this._surface)
            return null;
        return (this._surface.getElementById(id) ??
            this._doc.getModelById(id) ??
            null);
    }
    _getRelatedGroupElements(group, oldChildIds) {
        const elements = new Set([group, ...group.descendantElements]);
        oldChildIds?.forEach(id => {
            const model = this._getModelById(id);
            if (!model)
                return;
            elements.add(model);
            if (isGfxGroupCompatibleModel(model)) {
                model.descendantElements.forEach(descendant => {
                    elements.add(descendant);
                });
            }
        });
        return [...elements];
    }
    _syncGroupChildSnapshot(group) {
        this._groupChildSnapshot.set(group.id, [...group.childIds]);
    }
    _initLayers() {
        let blockIdx = 0;
        let canvasIdx = 0;
        const layers = [];
        let curLayer;
        let currentCSSZindex = 1;
        const pushCurLayer = () => {
            if (curLayer) {
                curLayer.indexes = [
                    getElementIndex(curLayer.elements[0]),
                    getElementIndex(last(curLayer.elements)),
                ];
                curLayer.zIndex = currentCSSZindex;
                layers.push(curLayer);
                currentCSSZindex += curLayer.elements.length;
            }
        };
        const addLayer = (type) => {
            pushCurLayer();
            curLayer =
                type === 'canvas'
                    ? {
                        type,
                        indexes: [LayerManager.INITIAL_INDEX, LayerManager.INITIAL_INDEX],
                        zIndex: 0,
                        set: new Set(),
                        elements: [],
                        bound: new Bound(),
                    }
                    : {
                        type,
                        indexes: [LayerManager.INITIAL_INDEX, LayerManager.INITIAL_INDEX],
                        zIndex: 0,
                        set: new Set(),
                        elements: [],
                    };
        };
        while (blockIdx < this.blocks.length ||
            canvasIdx < this.canvasElements.length) {
            const curBlock = this.blocks[blockIdx];
            const curCanvas = this.canvasElements[canvasIdx];
            if (!curBlock && !curCanvas) {
                break;
            }
            if (!curBlock) {
                if (curLayer?.type !== 'canvas') {
                    addLayer('canvas');
                }
                assertType(curLayer);
                const remains = this.canvasElements.slice(canvasIdx);
                curLayer.elements = curLayer.elements.concat(remains);
                remains.forEach(element => curLayer.set.add(element));
                break;
            }
            if (!curCanvas) {
                if (curLayer?.type !== 'block') {
                    addLayer('block');
                }
                assertType(curLayer);
                const remains = this.blocks.slice(blockIdx);
                curLayer.elements = curLayer.elements.concat(remains);
                remains.forEach(block => curLayer.set.add(block));
                break;
            }
            const order = compare(curBlock, curCanvas);
            switch (order) {
                case -1:
                    if (curLayer?.type !== 'block') {
                        addLayer('block');
                    }
                    assertType(curLayer);
                    curLayer.set.add(curBlock);
                    curLayer.elements.push(curBlock);
                    ++blockIdx;
                    break;
                case 1:
                    if (curLayer?.type !== 'canvas') {
                        addLayer('canvas');
                    }
                    assertType(curLayer);
                    curLayer.set.add(curCanvas);
                    curLayer.elements.push(curCanvas);
                    ++canvasIdx;
                    break;
                case 0:
                    if (!curLayer) {
                        addLayer('block');
                    }
                    if (curLayer.type === 'block') {
                        curLayer.set.add(curBlock);
                        curLayer.elements.push(curBlock);
                        ++blockIdx;
                    }
                    else {
                        curLayer.set.add(curCanvas);
                        curLayer.elements.push(curCanvas);
                        ++canvasIdx;
                    }
                    break;
            }
        }
        if (curLayer && curLayer.elements.length) {
            pushCurLayer();
        }
        this.layers = layers;
        this._surface?.localElementModels.forEach(el => this.add(el));
    }
    _insertIntoLayer(target, type) {
        const layers = this.layers;
        let cur = layers.length - 1;
        const addToLayer = (layer, element, position) => {
            assertType(layer);
            assertType(element);
            if (position === 'tail') {
                layer.elements.push(element);
            }
            else {
                layer.elements.splice(position, 0, element);
            }
            layer.set.add(element);
            if (position === 'tail' ||
                position === 0 ||
                position === layer.elements.length - 1) {
                layer.indexes = [
                    getElementIndex(layer.elements[0]),
                    getElementIndex(last(layer.elements)),
                ];
            }
        };
        const createLayer = (type, targets, curZIndex) => {
            const newLayer = {
                type,
                set: new Set(targets),
                indexes: [
                    getElementIndex(targets[0]),
                    getElementIndex(last(targets)),
                ],
                zIndex: curZIndex + 1,
                elements: targets,
            };
            return newLayer;
        };
        if (!last(this.layers) ||
            [SortOrder.AFTER, SortOrder.SAME].includes(compare(target, last(last(this.layers).elements)))) {
            const layer = last(this.layers);
            if (layer?.type === type) {
                addToLayer(layer, target, 'tail');
                updateLayersZIndex(layers, cur);
            }
            else {
                this.layers.push(createLayer(type, [target], getLayerEndZIndex(layers, layers.length - 1)));
            }
        }
        else {
            while (cur > -1) {
                const layer = layers[cur];
                const layerElements = layer.elements;
                if (isInRange([
                    layerElements[0],
                    last(layerElements),
                ], target)) {
                    const insertIdx = layerElements.findIndex((_, idx) => {
                        const pre = layerElements[idx - 1];
                        return (compare(target, layerElements[idx]) < 0 &&
                            (!pre || compare(target, pre) >= 0));
                    });
                    if (layer.type === type) {
                        addToLayer(layer, target, insertIdx);
                        updateLayersZIndex(layers, cur);
                    }
                    else {
                        const splicedElements = layer.elements.splice(insertIdx);
                        layer.set = new Set(layer.elements);
                        layers.splice(cur + 1, 0, createLayer(layer.type, splicedElements, 1));
                        layers.splice(cur + 1, 0, createLayer(type, [target], 1));
                        updateLayersZIndex(layers, cur);
                    }
                    break;
                }
                else {
                    const nextLayer = layers[cur - 1];
                    if (!nextLayer ||
                        compare(target, last(nextLayer.elements)) >= 0) {
                        if (layer.type === type) {
                            addToLayer(layer, target, 0);
                            updateLayersZIndex(layers, cur);
                        }
                        else {
                            if (nextLayer) {
                                addToLayer(nextLayer, target, 'tail');
                                updateLayersZIndex(layers, cur - 1);
                            }
                            else {
                                layers.unshift(createLayer(type, [target], 1));
                                updateLayersZIndex(layers, 0);
                            }
                        }
                        break;
                    }
                }
                --cur;
            }
        }
    }
    _removeFromLayer(target, type) {
        const layers = this.layers;
        const index = layers.findIndex(layer => {
            if (layer.type !== type)
                return false;
            assertType(layer);
            assertType(target);
            if (layer.set.has(target)) {
                layer.set.delete(target);
                const idx = layer.elements.indexOf(target);
                if (idx !== -1) {
                    layer.elements.splice(layer.elements.indexOf(target), 1);
                    if (layer.elements.length) {
                        layer.indexes = [
                            getElementIndex(layer.elements[0]),
                            getElementIndex(last(layer.elements)),
                        ];
                    }
                }
                return true;
            }
            return false;
        });
        if (index === -1)
            return;
        const isDeletedAtEdge = index === 0 || index === layers.length - 1;
        if (layers[index].set.size === 0) {
            if (isDeletedAtEdge) {
                layers.splice(index, 1);
                if (layers[index]) {
                    updateLayersZIndex(layers, index);
                }
            }
            else {
                const lastLayer = layers[index - 1];
                const nextLayer = layers[index + 1];
                lastLayer.elements = lastLayer.elements.concat(nextLayer.elements);
                lastLayer.set = new Set(lastLayer.elements);
                layers.splice(index, 2);
                updateLayersZIndex(layers, index - 1);
            }
            return;
        }
        updateLayersZIndex(layers, index);
    }
    _refreshElementsInLayer(elements) {
        const uniqueElements = [...new Set(elements)];
        uniqueElements.forEach(element => {
            const modelType = this._getModelType(element);
            if (modelType === 'canvas') {
                removeFromOrderedArray(this.canvasElements, element);
                insertToOrderedArray(this.canvasElements, element);
            }
            else {
                removeFromOrderedArray(this.blocks, element);
                insertToOrderedArray(this.blocks, element);
            }
        });
        uniqueElements.forEach(element => {
            this._removeFromLayer(element, this._getModelType(element));
        });
        uniqueElements.sort(compare).forEach(element => {
            this._insertIntoLayer(element, this._getModelType(element));
        });
    }
    _reset() {
        const elements = this._doc
            .getAllModels()
            .filter(model => model instanceof GfxBlockElementModel &&
            (model.parent instanceof SurfaceBlockModel ||
                model.parent?.role === 'root')).concat(this._surface?.elementModels ?? []);
        this.canvasElements = [];
        this.blocks = [];
        elements.forEach(element => {
            if (element instanceof GfxPrimitiveElementModel) {
                this.canvasElements.push(element);
            }
            else {
                this.blocks.push(element);
            }
        });
        this.canvasElements.sort(compare);
        this.blocks.sort(compare);
        this._groupChildSnapshot.clear();
        this.canvasElements.forEach(element => {
            if (isGfxGroupCompatibleModel(element)) {
                this._syncGroupChildSnapshot(element);
            }
        });
        this.blocks.forEach(element => {
            if (isGfxGroupCompatibleModel(element)) {
                this._syncGroupChildSnapshot(element);
            }
        });
        this._initLayers();
        this._buildCanvasLayers();
    }
    /**
     * @returns a boolean value to indicate whether the layers have been updated
     */
    _updateLayer(element, props, _oldValues) {
        const modelType = this._getModelType(element);
        const isLocalElem = element instanceof GfxLocalElementModel;
        const indexChanged = !props || 'index' in props;
        const childIdsChanged = props && ('childIds' in props || 'childElementIds' in props);
        const shouldUpdateGroupChildren = isGfxGroupCompatibleModel(element) && (indexChanged || childIdsChanged);
        const updateArray = (array, element) => {
            if (!indexChanged)
                return;
            removeFromOrderedArray(array, element);
            insertToOrderedArray(array, element);
        };
        if (shouldUpdateGroupChildren) {
            this._reset();
            return true;
        }
        if (!isLocalElem) {
            if (modelType === 'canvas') {
                updateArray(this.canvasElements, element);
            }
            else {
                updateArray(this.blocks, element);
            }
        }
        if (indexChanged || childIdsChanged) {
            this._removeFromLayer(element, modelType);
            this._insertIntoLayer(element, modelType);
            return true;
        }
        return false;
    }
    add(element) {
        const modelType = this._getModelType(element);
        const isContainer = isGfxGroupCompatibleModel(element);
        const isLocalElem = element instanceof GfxLocalElementModel;
        if (isContainer) {
            element.childElements.forEach(child => {
                const childModelType = this._getModelType(child);
                removeFromOrderedArray(childModelType === 'canvas' ? this.canvasElements : this.blocks, child);
            });
        }
        if (!isLocalElem) {
            insertToOrderedArray(modelType === 'canvas' ? this.canvasElements : this.blocks, element);
        }
        if (isContainer) {
            this._syncGroupChildSnapshot(element);
        }
        this._insertIntoLayer(element, modelType);
        if (isContainer) {
            element.childElements.forEach(child => child && this._updateLayer(child));
        }
        this._buildCanvasLayers();
        this.slots.layerUpdated.next({
            type: 'add',
            initiatingElement: element,
        });
    }
    /**
     * Pass to the `Array.sort` to  sort the elements by their index
     */
    compare(a, b) {
        return compare(a, b);
    }
    /**
     * In some cases, we need to generate a bunch of indexes in advance before acutally adding the elements to the layer manager.
     * Eg. when importing a template. The `generateIndex` is a function only depends on the current state of the manager.
     * So we cannot use it because it will always return the same index if the element is not added to manager.
     *
     * This function return a index generator that can "remember" the index it generated without actually adding the element to the manager.
     *
     * @note The generator cannot work with `group` element.
     *
     * @returns
     */
    createIndexGenerator() {
        const manager = new LayerManager(this.gfx);
        manager._reset();
        return () => {
            const idx = manager.generateIndex();
            const bound = new Bound(0, 0, 10, 10);
            const mockedFakeElement = {
                index: idx,
                type: 'shape',
                x: 0,
                y: 0,
                w: 10,
                h: 10,
                elementBound: bound,
                xywh: '[0, 0, 10, 10]',
                get group() {
                    return null;
                },
                get groups() {
                    return [];
                },
            };
            manager.add(mockedFakeElement);
            return idx;
        };
    }
    delete(element) {
        let deleteType = undefined;
        const isGroup = isGfxGroupCompatibleModel(element);
        const isLocalElem = element instanceof GfxLocalElementModel;
        if (isGroup) {
            const groupElements = this._getRelatedGroupElements(element);
            const descendants = groupElements.filter(model => model !== element);
            if (!isLocalElem) {
                const groupType = this._getModelType(element);
                if (groupType === 'canvas') {
                    removeFromOrderedArray(this.canvasElements, element);
                }
                else {
                    removeFromOrderedArray(this.blocks, element);
                }
                this._removeFromLayer(element, groupType);
            }
            this._groupChildSnapshot.delete(element.id);
            this._refreshElementsInLayer(descendants);
            this._buildCanvasLayers();
            this.slots.layerUpdated.next({
                type: 'delete',
                initiatingElement: element,
            });
            return;
        }
        if (element instanceof GfxPrimitiveElementModel ||
            element instanceof GfxLocalElementModel) {
            deleteType = 'canvas';
            if (!isLocalElem) {
                removeFromOrderedArray(this.canvasElements, element);
            }
        }
        else {
            deleteType = 'block';
            removeFromOrderedArray(this.blocks, element);
        }
        this._removeFromLayer(element, deleteType);
        this._buildCanvasLayers();
        this.slots.layerUpdated.next({
            type: 'delete',
            initiatingElement: element,
        });
    }
    unmounted() {
        this.slots.layerUpdated.complete();
        this._groupChildSnapshot.clear();
        this._disposable.dispose();
    }
    /**
     * @param reverse - if true, generate the index in reverse order
     * @returns
     */
    generateIndex(reverse = false) {
        if (reverse) {
            const firstIndex = this.layers[0]?.indexes[0];
            return firstIndex
                ? generateKeyBetween(null, ungroupIndex(firstIndex))
                : LayerManager.INITIAL_INDEX;
        }
        else {
            const lastIndex = last(this.layers)?.indexes[1];
            return lastIndex
                ? generateKeyBetween(ungroupIndex(lastIndex), null)
                : LayerManager.INITIAL_INDEX;
        }
    }
    getCanvasLayers() {
        return this.canvasLayers;
    }
    getReorderedIndex(element, direction) {
        const group = element.group || null;
        let elements;
        if (group !== null) {
            elements = group.childElements;
            elements.sort(compare);
        }
        else {
            elements = this.layers.reduce((pre, current) => pre.concat(current.elements.filter(element => element.group == null)), []);
        }
        const currentIdx = elements.indexOf(element);
        switch (direction) {
            case 'forward':
            case 'front':
                if (currentIdx === -1 || currentIdx === elements.length - 1)
                    return element.index;
                {
                    const next = direction === 'forward'
                        ? elements[currentIdx + 1]
                        : elements[elements.length - 1];
                    const next2 = direction === 'forward' ? elements[currentIdx + 2] : null;
                    return generateKeyBetween(next.index, next2?.index
                        ? next.index < next2.index
                            ? next2.index
                            : null
                        : null);
                }
            case 'backward':
            case 'back':
                if (currentIdx === -1 || currentIdx === 0)
                    return element.index;
                {
                    const pre = direction === 'backward' ? elements[currentIdx - 1] : elements[0];
                    const pre2 = direction === 'backward' ? elements[currentIdx - 2] : null;
                    return generateKeyBetween(!pre2 || pre2?.index >= pre.index ? null : pre2.index, pre.index);
                }
        }
    }
    getZIndex(element) {
        // @ts-expect-error FIXME: ts error
        const layer = this.layers.find(layer => layer.set.has(element));
        if (!layer)
            return 0;
        // @ts-expect-error FIXME: ts error
        return layer.zIndex + layer.elements.indexOf(element);
    }
    update(element, props, oldValues) {
        if (this._updateLayer(element, props, oldValues)) {
            this._buildCanvasLayers();
            this.slots.layerUpdated.next({
                type: 'update',
                initiatingElement: element,
            });
        }
    }
    mounted() {
        const store = this._doc;
        this._disposable.add(store.slots.blockUpdated.subscribe(payload => {
            if (payload.type === 'add') {
                const block = store.getModelById(payload.id);
                if (block instanceof GfxBlockElementModel &&
                    (block.parent instanceof SurfaceBlockModel ||
                        block.parent?.role === 'root') &&
                    this.blocks.indexOf(block) === -1) {
                    this.add(block);
                }
            }
            if (payload.type === 'update') {
                const block = store.getModelById(payload.id);
                if ((payload.props.key === 'index' ||
                    payload.props.key === 'childElementIds') &&
                    block instanceof GfxBlockElementModel &&
                    (block.parent instanceof SurfaceBlockModel ||
                        block.parent?.role === 'root')) {
                    this.update(block, {
                        [payload.props.key]: true,
                    });
                }
            }
            if (payload.type === 'delete') {
                const block = store.getModelById(payload.id);
                if (block instanceof GfxBlockElementModel) {
                    this.delete(block);
                }
            }
        }));
        const watchSurface = (surface) => {
            let lastChildMap = new Map(surface.childMap.peek());
            this._disposable.add(surface.childMap.subscribe(currentChildMap => {
                currentChildMap.forEach((_, id) => {
                    if (lastChildMap.has(id)) {
                        lastChildMap.delete(id);
                        return;
                    }
                });
                lastChildMap.forEach((_, id) => {
                    const model = this._doc.getModelById(id);
                    if (model instanceof GfxBlockElementModel) {
                        this.delete(model);
                    }
                });
                currentChildMap.forEach((_, id) => {
                    const model = store.getModelById(id);
                    if (model instanceof GfxBlockElementModel &&
                        !this.blocks.includes(model)) {
                        this.add(model);
                    }
                });
                lastChildMap = new Map(currentChildMap);
            }));
            this._disposable.add(surface.elementAdded.subscribe(payload => this.add(surface.getElementById(payload.id))));
            this._disposable.add(surface.elementUpdated.subscribe(payload => {
                if (payload.props['index'] || payload.props['childIds']) {
                    this.update(surface.getElementById(payload.id), payload.props, payload.oldValues);
                }
            }));
            this._disposable.add(surface.elementRemoved.subscribe(payload => this.delete(payload.model)));
            this._disposable.add(surface.localElementAdded.subscribe(elm => {
                this.add(elm);
            }));
            this._disposable.add(surface.localElementUpdated.subscribe(payload => {
                if (payload.props['index'] || payload.props['groupId']) {
                    this.update(payload.model, payload.props);
                }
            }));
            this._disposable.add(surface.localElementDeleted.subscribe(elm => {
                this.delete(elm);
            }));
        };
        if (this.gfx.surface) {
            watchSurface(this.gfx.surface);
        }
        else {
            this._disposable.add(this.gfx.surface$.subscribe(surface => {
                if (surface) {
                    watchSurface(surface);
                }
            }));
        }
    }
}
