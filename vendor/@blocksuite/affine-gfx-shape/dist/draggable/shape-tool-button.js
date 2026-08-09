import { ShapeType } from '@blocksuite/affine-model';
import { EdgelessToolbarToolMixin } from '@blocksuite/affine-widget-edgeless-toolbar';
import { SignalWatcher } from '@blocksuite/global/lit';
import { css, html, LitElement } from 'lit';
import { ShapeTool } from '../shape-tool.js';
export class EdgelessShapeToolButton extends EdgelessToolbarToolMixin(SignalWatcher(LitElement)) {
    constructor() {
        super(...arguments);
        this._handleShapeClick = (shape) => {
            this.setEdgelessTool(this.type, {
                shapeName: shape.name,
            });
            if (!this.popper)
                this._toggleMenu();
        };
        this._handleWrapperClick = () => {
            if (this.tryDisposePopper())
                return;
            this.setEdgelessTool(this.type, {
                shapeName: ShapeType.Rect,
            });
            if (!this.popper)
                this._toggleMenu();
        };
        this.type = ShapeTool;
    }
    static { this.styles = css `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    edgeless-toolbar-button,
    .shapes {
      width: 100%;
      height: 64px;
    }
  `; }
    _toggleMenu() {
        this.createPopper('edgeless-shape-menu', this, {
            setProps: ele => {
                ele.edgeless = this.edgeless;
                ele.onChange = (shapeName) => {
                    this.setEdgelessTool(this.type, {
                        shapeName,
                    });
                    this._updateOverlay();
                };
            },
        });
    }
    _updateOverlay() {
        const controller = this.gfx.tool.currentTool$.peek();
        if (controller instanceof ShapeTool) {
            controller.createOverlay();
        }
    }
    render() {
        const { active } = this;
        return html `
      <edgeless-toolbar-button
        class="edgeless-shape-button"
        .tooltip=${this.popper
            ? ''
            : html `<affine-tooltip-content-with-shortcut
              data-tip="${'Shape'}"
              data-shortcut="${'S'}"
            ></affine-tooltip-content-with-shortcut>`}
        .tooltipOffset=${5}
        .active=${active}
      >
        <edgeless-toolbar-shape-draggable
          .edgeless=${this.edgeless}
          .toolbarContainer=${this.toolbarContainer}
          class="shapes"
          @click=${this._handleWrapperClick}
          .onShapeClick=${this._handleShapeClick}
        >
        </edgeless-toolbar-shape-draggable>
      </edgeless-toolbar-button>
    `;
    }
}
