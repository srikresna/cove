import { LitElement, type PropertyValues } from 'lit';
import type { SliderRange, SliderStyle } from './types';
declare const Slider_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class Slider extends Slider_base {
    static styles: import("lit").CSSResult;
    accessor value: number;
    accessor disabled: boolean;
    accessor tooltip: string | undefined;
    accessor range: SliderRange;
    accessor sliderStyle: Partial<SliderStyle> | undefined;
    private get _sliderStyle();
    private _onSelect;
    private _updateLineWidthPanelByDragHandlePosition;
    private readonly _getDragHandlePosition;
    private readonly _onPointerDown;
    private readonly _onPointerMove;
    connectedCallback(): void;
    willUpdate(changedProperties: PropertyValues<this>): void;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
//# sourceMappingURL=slider.d.ts.map