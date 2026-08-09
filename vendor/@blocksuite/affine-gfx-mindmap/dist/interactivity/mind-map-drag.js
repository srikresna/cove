import { CanvasRenderer, OverlayIdentifier, } from '@blocksuite/affine-block-surface';
import { MindmapElementModel, } from '@blocksuite/affine-model';
import { InteractivityExtension, isGfxGroupCompatibleModel, } from '@blocksuite/std/gfx';
import { isMindmapNode, isSingleMindMapNode } from '../utils';
import { NODE_HORIZONTAL_SPACING, NODE_VERTICAL_SPACING } from '../view/layout';
import { containsNode, createFromTree, detachMindmap, findTargetNode, hideNodeConnector, tryMoveNode, } from '../view/utils';
import { calculateResponseArea } from './drag-utils';
export class MindMapDragExtension extends InteractivityExtension {
    constructor() {
        super(...arguments);
        /**
         * The response area of the mind map is calculated in real time.
         * It only needs to be calculated once when the mind map is dragged.
         */
        this._responseAreaUpdated = new Set();
    }
    static { this.key = 'mind-map-drag'; }
    get _indicatorOverlay() {
        return this.std.getOptional(OverlayIdentifier('mindmap-indicator'));
    }
    _calcDragResponseArea(mindmap) {
        calculateResponseArea(mindmap);
        this._responseAreaUpdated.add(mindmap);
    }
    /**
     * Create handlers that can drag and drop mind map nodes
     * @param dragMindMapCtx
     * @param dragState
     * @returns
     */
    _createManipulationHandlers(dragMindMapCtx) {
        let hoveredCtx = null;
        return {
            onDragMove: (context) => {
                const { x, y } = context.dragLastPos;
                const hoveredMindMap = this._getHoveredMindMap([x, y], dragMindMapCtx);
                const indicator = this._indicatorOverlay;
                if (indicator) {
                    indicator.currentDragPos = [x, y];
                    indicator.refresh();
                }
                hoveredCtx?.abort?.();
                const hoveredNode = hoveredMindMap
                    ? findTargetNode(hoveredMindMap, [x, y])
                    : null;
                hoveredCtx = {
                    mindmap: hoveredMindMap,
                    node: hoveredNode,
                };
                // hovered on the currently dragged mind map but
                // 1. not hovered on any node or
                // 2. hovered on the node that is itself or its children (which is not allowed)
                // then consider user is trying to drop the node to its original position
                if (hoveredNode &&
                    hoveredMindMap &&
                    !containsNode(hoveredMindMap, hoveredNode, dragMindMapCtx.node)) {
                    const operation = tryMoveNode(hoveredMindMap, hoveredNode, dragMindMapCtx.mindmap, dragMindMapCtx.node, [x, y], options => this._drawIndicator(options));
                    if (operation) {
                        hoveredCtx.abort = operation.abort;
                        hoveredCtx.merge = operation.merge;
                    }
                }
                else if (dragMindMapCtx.isRoot) {
                    dragMindMapCtx.mindmap.layout();
                    hoveredCtx.merge = () => {
                        dragMindMapCtx.mindmap.layout();
                    };
                }
                else {
                    // if `hoveredMindMap` is not null
                    // either the node is hovered on the dragged node's children
                    // or the there is no hovered node at all
                    // then consider user is trying to place the node to its original position
                    if (hoveredMindMap) {
                        const { node: draggedNode, mindmap } = dragMindMapCtx;
                        const nodeBound = draggedNode.element.elementBound;
                        hoveredCtx.abort = this._drawIndicator({
                            targetMindMap: mindmap,
                            target: draggedNode,
                            sourceMindMap: mindmap,
                            source: draggedNode,
                            newParent: draggedNode.parent,
                            insertPosition: {
                                type: 'sibling',
                                layoutDir: mindmap.getLayoutDir(draggedNode),
                                position: y > nodeBound.y + nodeBound.h / 2 ? 'next' : 'prev',
                            },
                            path: mindmap.getPath(draggedNode),
                        });
                    }
                    else {
                        hoveredCtx.detach = true;
                        const reset = (hoveredCtx.abort = hideNodeConnector(dragMindMapCtx.mindmap, dragMindMapCtx.node));
                        hoveredCtx.abort = () => {
                            reset?.();
                        };
                    }
                }
            },
            onDragEnd: (dragEndContext) => {
                if (hoveredCtx?.merge) {
                    hoveredCtx.merge();
                }
                else {
                    hoveredCtx?.abort?.();
                    if (hoveredCtx?.detach) {
                        const { x: startX, y: startY } = dragEndContext.dragStartPos;
                        const { x: endX, y: endY } = dragEndContext.dragLastPos;
                        dragMindMapCtx.node.element.xywh =
                            dragMindMapCtx.node.element.elementBound
                                .moveDelta(endX - startX, endY - startY)
                                .serialize();
                        if (dragMindMapCtx.node !== dragMindMapCtx.mindmap.tree) {
                            detachMindmap(dragMindMapCtx.mindmap, dragMindMapCtx.node);
                            const mindmap = createFromTree(dragMindMapCtx.node, dragMindMapCtx.mindmap.style, dragMindMapCtx.mindmap.layoutType, this.gfx.surface);
                            mindmap.layout();
                        }
                        else {
                            dragMindMapCtx.mindmap.layout();
                        }
                    }
                }
                hoveredCtx = null;
                this._responseAreaUpdated.clear();
            },
        };
    }
    /**
     * Create handlers that can translate entire mind map
     */
    _createTranslationHandlers(ctx) {
        return {
            onDragStart: () => {
                ctx.nodes.forEach(node => {
                    node.stash('xywh');
                });
            },
            onDragEnd: () => {
                ctx.mindmaps.forEach(mindmap => {
                    mindmap.layout();
                });
            },
        };
    }
    _drawIndicator(options) {
        const indicatorOverlay = this._indicatorOverlay;
        if (!indicatorOverlay) {
            return () => { };
        }
        // draw the indicator at given position
        const { newParent, insertPosition, targetMindMap, target, source, path } = options;
        const children = newParent.children.filter(node => node.element.id !== source.id);
        indicatorOverlay.setIndicatorInfo({
            targetMindMap,
            target,
            parent: newParent,
            insertPosition,
            parentChildren: children,
            path,
        });
        return () => {
            indicatorOverlay.clear();
        };
    }
    _getHoveredMindMap(position, dragMindMapCtx) {
        const mindmap = this.gfx
            .getElementByPoint(position[0], position[1], {
            all: true,
            responsePadding: [NODE_HORIZONTAL_SPACING, NODE_VERTICAL_SPACING * 2],
        })
            .find(el => {
            if (!(el instanceof MindmapElementModel)) {
                return false;
            }
            if (el === dragMindMapCtx.mindmap &&
                !dragMindMapCtx.originalMindMapBound.containsPoint(position)) {
                return false;
            }
            return true;
        }) ?? null;
        if (mindmap &&
            (!this._responseAreaUpdated.has(mindmap) || !mindmap.tree.responseArea)) {
            this._calcDragResponseArea(mindmap);
        }
        return mindmap;
    }
    _setupDragNodeImage(mindmapNode, pos) {
        const surfaceBlock = this.gfx
            .surfaceComponent;
        const renderer = surfaceBlock?.renderer;
        const indicatorOverlay = this._indicatorOverlay;
        // TODO: handle DOM renderer case for mindmap drag image
        if (!renderer ||
            !(renderer instanceof CanvasRenderer) ||
            !indicatorOverlay) {
            console.warn('Skipping drag image setup: DOM renderer or overlay missing.');
            return () => { }; // Return an empty cleanup function
        }
        const nodeBound = mindmapNode.element.elementBound;
        const canvas = renderer.getCanvasByBound(mindmapNode.element.elementBound, [mindmapNode.element], undefined, undefined, false);
        indicatorOverlay.dragNodePos = [nodeBound.x - pos.x, nodeBound.y - pos.y];
        indicatorOverlay.dragNodeImage = canvas;
        return () => {
            indicatorOverlay.dragNodeImage = null;
            indicatorOverlay.currentDragPos = null;
        };
    }
    _updateNodeOpacity(mindmap, mindNode) {
        const OPACITY = 0.3;
        const updatedNodes = new Set();
        const traverse = (node, parent) => {
            node.element.opacity = OPACITY;
            updatedNodes.add(node.element);
            if (parent) {
                const connectorId = `#${parent.element.id}-${node.element.id}`;
                const connector = mindmap.connectors.get(connectorId);
                if (connector) {
                    connector.opacity = OPACITY;
                    updatedNodes.add(connector);
                }
            }
            if (node.children.length) {
                node.children.forEach(child => traverse(child, node));
            }
        };
        const parentNode = mindmap.getParentNode(mindNode.element.id) ?? null;
        traverse(mindNode, parentNode);
        return () => {
            updatedNodes.forEach(el => {
                el.opacity = 1;
            });
        };
    }
    mounted() {
        this.action.onDragInitialize((context) => {
            if (isSingleMindMapNode(context.elements)) {
                const mindmap = context.elements[0].group;
                const mindmapNode = mindmap.getNode(context.elements[0].id);
                const mindmapBound = mindmap.elementBound;
                const isRoot = mindmapNode === mindmap.tree;
                mindmapBound.x -= NODE_HORIZONTAL_SPACING;
                mindmapBound.y -= NODE_VERTICAL_SPACING * 2;
                mindmapBound.w += NODE_HORIZONTAL_SPACING * 2;
                mindmapBound.h += NODE_VERTICAL_SPACING * 4;
                this._calcDragResponseArea(mindmap);
                const clearDragStatus = isRoot
                    ? mindmap.stashTree(mindmapNode)
                    : this._setupDragNodeImage(mindmapNode, context.dragStartPos);
                const clearOpacity = this._updateNodeOpacity(mindmap, mindmapNode);
                if (!isRoot) {
                    context.elements.splice(0, 1);
                }
                const mindMapDragCtx = {
                    mindmap,
                    node: mindmapNode,
                    isRoot,
                    originalMindMapBound: mindmapBound,
                };
                return {
                    ...this._createManipulationHandlers(mindMapDragCtx),
                    clear() {
                        clearOpacity();
                        clearDragStatus?.();
                        if (!isRoot) {
                            context.elements.push(mindmapNode.element);
                        }
                    },
                };
            }
            const mindmapNodes = new Set();
            const mindmaps = new Set();
            context.elements.forEach(el => {
                if (isMindmapNode(el)) {
                    const mindmap = el.group instanceof MindmapElementModel
                        ? el.group
                        : el;
                    mindmaps.add(mindmap);
                    mindmap.childElements.forEach(child => mindmapNodes.add(child));
                }
                else if (isGfxGroupCompatibleModel(el)) {
                    el.descendantElements.forEach(desc => {
                        if (desc.group instanceof MindmapElementModel) {
                            mindmaps.add(desc.group);
                            desc.group.childElements.forEach(_el => mindmapNodes.add(_el));
                        }
                    });
                }
            });
            if (mindmapNodes.size > 1) {
                mindmapNodes.forEach(node => context.elements.push(node));
                return this._createTranslationHandlers({
                    mindmaps,
                    nodes: mindmapNodes,
                });
            }
            return {};
        });
    }
}
