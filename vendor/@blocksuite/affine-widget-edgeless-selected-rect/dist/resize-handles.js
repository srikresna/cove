import { html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
export var HandleDirection;
(function (HandleDirection) {
    HandleDirection["Bottom"] = "bottom";
    HandleDirection["BottomLeft"] = "bottom-left";
    HandleDirection["BottomRight"] = "bottom-right";
    HandleDirection["Left"] = "left";
    HandleDirection["Right"] = "right";
    HandleDirection["Top"] = "top";
    HandleDirection["TopLeft"] = "top-left";
    HandleDirection["TopRight"] = "top-right";
})(HandleDirection || (HandleDirection = {}));
function ResizeHandleRenderer(handle, rotatable, onPointerDown, getCursor) {
    const handlerPointerDown = (e) => {
        e.stopPropagation();
        onPointerDown && onPointerDown(e, handle);
    };
    const rotationTpl = handle.length > 6 && rotatable
        ? html `<div
          class="rotate"
          style=${styleMap({
            cursor: getCursor
                ? getCursor({
                    type: 'rotate',
                    handle,
                })
                : 'default',
        })}
        ></div>`
        : nothing;
    return html `<div
    class="handle"
    aria-label=${handle}
    @pointerdown=${handlerPointerDown}
  >
    ${rotationTpl}
    <div
      class="resize transparent-handle"
      style=${styleMap({
        cursor: getCursor
            ? getCursor({
                type: 'resize',
                handle,
            })
            : 'default',
    })}
    ></div>
  </div>`;
}
export function RenderResizeHandles(resizeHandles, rotatable, onPointerDown, getCursor) {
    return html `
    ${repeat(resizeHandles, handle => handle, handle => ResizeHandleRenderer(handle, rotatable, onPointerDown, getCursor))}
  `;
}
