var _a;
import { BlockSuiteError, ErrorCode } from "@blocksuite/global/exceptions";
import { Bound } from "@blocksuite/global/gfx";
import { computed, effect, signal } from "@preact/signals-core";
import { nothing } from "lit";
import { GfxControllerIdentifier } from "../../gfx/identifiers.js";
import { SurfaceSelection } from "../../selection/index.js";
import { BlockComponent } from "./block-component.js";
export function isGfxBlockComponent(element) {
  return element?.[GfxElementSymbol] === true;
}
export const GfxElementSymbol = Symbol("GfxElement");
function updateTransform(element) {
  if (element.transformState$.value === "idle") return;
  const { viewport } = element.gfx;
  element.dataset.viewportState = viewport.serializeRecord();
  element.style.transformOrigin = "0 0";
  element.style.transform = element.getCSSTransform();
}
function updateZIndex(element) {
  const zIndex = element.toZIndex();
  if (element.style.zIndex !== zIndex) {
    element.style.zIndex = zIndex;
  }
}
function updateBlockVisibility(view) {
  if (view.transformState$.value === "active") {
    view.style.visibility = "visible";
    view.style.pointerEvents = "auto";
    view.classList.remove("block-idle", "block-survival");
    view.classList.add("block-active");
  } else if (view.transformState$.value === "survival") {
    view.style.visibility = "visible";
    view.style.pointerEvents = "none";
    view.classList.remove("block-active", "block-idle");
    view.classList.add("block-survival");
  } else {
    view.style.visibility = "hidden";
    view.style.pointerEvents = "none";
    view.classList.remove("block-active", "block-survival");
    view.classList.add("block-idle");
  }
}
function handleGfxConnection(instance) {
  instance.style.position = "absolute";
  const viewport = instance.gfx.viewport;
  instance.disposables.add(
    viewport.viewportUpdated.subscribe(() => {
      // When SKIP_REFRESH_DURING_GESTURE is enabled and a gesture is active,
      // skip per-block transform updates. The viewport-element applies a
      // container-level CSS transform to keep visuals in sync instead.
      if (
        viewport.SKIP_REFRESH_DURING_GESTURE &&
        (viewport.panning$.value || viewport.zooming$.value)
      ) {
        return;
      }
      updateTransform(instance);
    }),
  );
  instance.disposables.add(
    instance.store.slots.blockUpdated.subscribe(({ type, id }) => {
      if (id === instance.model.id && type === "update") {
        updateTransform(instance);
        updateZIndex(instance);
      }
    }),
  );
  instance.disposables.add(
    instance.gfx.layer.slots.layerUpdated.subscribe(() => {
      updateZIndex(instance);
    }),
  );
  instance.disposables.add(
    effect(() => {
      updateBlockVisibility(instance);
      updateTransform(instance);
      updateZIndex(instance);
    }),
  );
}
export class GfxBlockComponent extends BlockComponent {
  constructor() {
    super(...arguments);
    this[_a] = true;
    this.transformState$ = signal("active");
    this.onDragMove = ({ dx, dy, currentBound }) => {
      this.model.xywh = currentBound.moveDelta(dx, dy).serialize();
    };
  }
  static {
    _a = GfxElementSymbol;
  }
  get gfx() {
    return this.std.get(GfxControllerIdentifier);
  }
  connectedCallback() {
    super.connectedCallback();
    handleGfxConnection(this);
  }
  onDragStart() {
    this.model.stash("xywh");
  }
  onDragEnd() {
    this.model.pop("xywh");
  }
  onBoxSelected(_) {}
  getCSSScaleVal() {
    const viewport = this.gfx.viewport;
    const { zoom, viewScale } = viewport;
    return zoom / viewScale;
  }
  getCSSTransform() {
    const viewport = this.gfx.viewport;
    const { translateX, translateY, zoom, viewScale } = viewport;
    const bound = Bound.deserialize(this.model.xywh);
    const scaledX = (bound.x * zoom) / viewScale;
    const scaledY = (bound.y * zoom) / viewScale;
    const deltaX = scaledX - bound.x;
    const deltaY = scaledY - bound.y;
    return `translate(${translateX / viewScale + deltaX}px, ${translateY / viewScale + deltaY}px) scale(${this.getCSSScaleVal()})`;
  }
  getRenderingRect() {
    const { xywh$ } = this.model;
    if (!xywh$) {
      throw new BlockSuiteError(
        ErrorCode.GfxBlockElementError,
        `Error on rendering '${this.model.flavour}': Gfx block's model should have 'xywh' property.`,
      );
    }
    const [x, y, w, h] = JSON.parse(xywh$.value);
    return { x, y, w, h, zIndex: this.toZIndex() };
  }
  renderBlock() {
    const { x, y, w, h, zIndex } = this.getRenderingRect();
    if (this.style.left !== `${x}px`) this.style.left = `${x}px`;
    if (this.style.top !== `${y}px`) this.style.top = `${y}px`;
    if (this.style.width !== `${w}px`) this.style.width = `${w}px`;
    if (this.style.height !== `${h}px`) this.style.height = `${h}px`;
    if (this.style.zIndex !== zIndex) this.style.zIndex = zIndex;
    return this.renderGfxBlock();
  }
  renderGfxBlock() {
    return nothing;
  }
  renderPageContent() {
    return nothing;
  }
  async scheduleUpdate() {
    const parent = this.parentElement;
    if (this.hasUpdated || !parent || !("scheduleUpdateChildren" in parent)) {
      return super.scheduleUpdate();
    } else {
      await parent.scheduleUpdateChildren(this.model.id);
      return super.scheduleUpdate();
    }
  }
  toZIndex() {
    return this.gfx.layer.getZIndex(this.model).toString() ?? "0";
  }
  updateZIndex() {
    this.style.zIndex = this.toZIndex();
  }
}
export function toGfxBlockComponent(CustomBlock) {
  var _b;
  // @ts-expect-error ignore
  return class extends CustomBlock {
    constructor() {
      super(...arguments);
      this[_b] = true;
      this.transformState$ = signal("active");
      this.selected$ = computed(() => {
        const selection = this.std.selection.value.find(
          (selection) => selection.blockId === this.model?.id,
        );
        if (!selection) return false;
        return selection.is(SurfaceSelection);
      });
    }
    static {
      _b = GfxElementSymbol;
    }
    onDragMove({ dx, dy, currentBound }) {
      this.model.xywh = currentBound.moveDelta(dx, dy).serialize();
    }
    onDragStart() {
      this.model.stash("xywh");
    }
    onDragEnd() {
      this.model.pop("xywh");
    }
    onBoxSelected(_) {}
    get gfx() {
      return this.std.get(GfxControllerIdentifier);
    }
    connectedCallback() {
      super.connectedCallback();
      handleGfxConnection(this);
    }
    getCSSScaleVal() {
      return GfxBlockComponent.prototype.getCSSScaleVal.call(this);
    }
    getCSSTransform() {
      return GfxBlockComponent.prototype.getCSSTransform.call(this);
    }
    // oxlint-disable-next-line sonarjs/no-identical-functions
    getRenderingRect() {
      const { xywh$ } = this.model;
      if (!xywh$) {
        throw new BlockSuiteError(
          ErrorCode.GfxBlockElementError,
          `Error on rendering '${this.model.flavour}': Gfx block's model should have 'xywh' property.`,
        );
      }
      const [x, y, w, h] = JSON.parse(xywh$.value);
      return { x, y, w, h, zIndex: this.toZIndex() };
    }
    renderBlock() {
      const { x, y, w, h, zIndex } = this.getRenderingRect();
      this.style.left = `${x}px`;
      this.style.top = `${y}px`;
      this.style.width = typeof w === "number" ? `${w}px` : w;
      this.style.height = typeof h === "number" ? `${h}px` : h;
      this.style.zIndex = zIndex;
      return this.renderGfxBlock();
    }
    renderGfxBlock() {
      return this.renderPageContent();
    }
    renderPageContent() {
      return super.renderBlock();
    }
    // oxlint-disable-next-line sonarjs/no-identical-functions
    async scheduleUpdate() {
      const parent = this.parentElement;
      if (this.hasUpdated || !parent || !("scheduleUpdateChildren" in parent)) {
        return super.scheduleUpdate();
      } else {
        await parent.scheduleUpdateChildren(this.model.id);
        return super.scheduleUpdate();
      }
    }
    toZIndex() {
      return this.gfx.layer.getZIndex(this.model).toString() ?? "0";
    }
    updateZIndex() {
      this.style.zIndex = this.toZIndex();
    }
  };
}
