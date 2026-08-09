import { type ShapeName } from '@blocksuite/affine-model';
import type { BlockComponent } from '@blocksuite/std';
import { LitElement } from 'lit';
declare const EdgelessShapeMenu_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessShapeMenu extends EdgelessShapeMenu_base {
    static styles: import("lit").CSSResult;
    private readonly _shapeName$;
    accessor edgeless: BlockComponent;
    private readonly _props$;
    private readonly _setFillColor;
    private readonly _setShapeStyle;
    private readonly _theme$;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor onChange: (name: ShapeName) => void;
}
export {};
//# sourceMappingURL=shape-menu.d.ts.map