import { ShapeStyle } from '@blocksuite/affine-model';
import { LitElement } from 'lit';
import { Subject } from 'rxjs';
import type { ShapeTool } from '../shape-tool';
export declare class EdgelessShapePanel extends LitElement {
    static styles: import("lit").CSSResult;
    slots: {
        select: Subject<import("@blocksuite/affine-model").ShapeName>;
    };
    private _onSelect;
    disconnectedCallback(): void;
    render(): unknown;
    accessor selectedShape: ShapeTool['activatedOption']['shapeName'] | null | undefined;
    accessor shapeStyle: ShapeStyle;
}
//# sourceMappingURL=shape-panel.d.ts.map