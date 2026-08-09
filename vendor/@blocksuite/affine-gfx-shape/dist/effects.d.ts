import { EdgelessShapePanel } from './components/shape-panel';
import { EdgelessShapeStylePanel } from './components/shape-style-panel';
import { EdgelessShapeMenu, EdgelessShapeToolButton, EdgelessShapeToolElement, EdgelessToolbarShapeDraggable } from './draggable';
import { EdgelessShapeTextEditor } from './text/edgeless-shape-text-editor';
export declare function effects(): void;
declare global {
    interface HTMLElementTagNameMap {
        'edgeless-shape-text-editor': EdgelessShapeTextEditor;
        'edgeless-shape-menu': EdgelessShapeMenu;
        'edgeless-shape-tool-element': EdgelessShapeToolElement;
        'edgeless-toolbar-shape-draggable': EdgelessToolbarShapeDraggable;
        'edgeless-shape-tool-button': EdgelessShapeToolButton;
        'edgeless-shape-panel': EdgelessShapePanel;
        'edgeless-shape-style-panel': EdgelessShapeStylePanel;
    }
}
//# sourceMappingURL=effects.d.ts.map