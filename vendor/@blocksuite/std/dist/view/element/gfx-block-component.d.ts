import type { BlockService } from "../../extension/index.js";
import type {
  BoxSelectionContext,
  DragMoveContext,
  GfxViewTransformInterface,
} from "../../gfx/interactivity/index.js";
import type { GfxBlockElementModel } from "../../gfx/model/gfx-block-model.js";
import { BlockComponent } from "./block-component.js";
export declare function isGfxBlockComponent(element: unknown): element is GfxBlockComponent;
export declare const GfxElementSymbol: unique symbol;
export declare abstract class GfxBlockComponent<
    Model extends GfxBlockElementModel = GfxBlockElementModel,
    Service extends BlockService = BlockService,
    WidgetName extends string = string,
  >
  extends BlockComponent<Model, Service, WidgetName>
  implements GfxViewTransformInterface
{
  [GfxElementSymbol]: boolean;
  readonly transformState$: import("@preact/signals-core").Signal<"idle" | "survival" | "active">;
  get gfx(): import("../../gfx/controller.js").GfxController;
  connectedCallback(): void;
  onDragMove: ({ dx, dy, currentBound }: DragMoveContext) => void;
  onDragStart(): void;
  onDragEnd(): void;
  onBoxSelected(_: BoxSelectionContext): void;
  getCSSScaleVal(): number;
  getCSSTransform(): string;
  getRenderingRect(): {
    x: any;
    y: any;
    w: any;
    h: any;
    zIndex: string;
  };
  renderBlock(): unknown;
  renderGfxBlock(): unknown;
  renderPageContent(): unknown;
  scheduleUpdate(): Promise<unknown>;
  toZIndex(): string;
  updateZIndex(): void;
}
export declare function toGfxBlockComponent<
  Model extends GfxBlockElementModel,
  Service extends BlockService,
  WidgetName extends string,
  B extends typeof BlockComponent<Model, Service, WidgetName>,
>(
  CustomBlock: B,
): B & {
  new (...args: any[]): GfxBlockComponent;
};
//# sourceMappingURL=gfx-block-component.d.ts.map
