import { EdgelessShapePanel } from './components/shape-panel';
import { EdgelessShapeStylePanel } from './components/shape-style-panel';
import { EdgelessShapeMenu, EdgelessShapeToolButton, EdgelessShapeToolElement, EdgelessToolbarShapeDraggable, } from './draggable';
import { EdgelessShapeTextEditor } from './text/edgeless-shape-text-editor';
export function effects() {
    customElements.define('edgeless-shape-text-editor', EdgelessShapeTextEditor);
    customElements.define('edgeless-shape-menu', EdgelessShapeMenu);
    customElements.define('edgeless-shape-tool-element', EdgelessShapeToolElement);
    customElements.define('edgeless-shape-tool-button', EdgelessShapeToolButton);
    customElements.define('edgeless-toolbar-shape-draggable', EdgelessToolbarShapeDraggable);
    customElements.define('edgeless-shape-panel', EdgelessShapePanel);
    customElements.define('edgeless-shape-style-panel', EdgelessShapeStylePanel);
}
