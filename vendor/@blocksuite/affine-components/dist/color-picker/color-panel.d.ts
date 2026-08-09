import type { Color, ColorScheme, Palette } from '@blocksuite/affine-model';
import { LitElement, type PropertyValues } from 'lit';
export declare class EdgelessColorButton extends LitElement {
    static styles: import("lit").CSSResult;
    get preprocessColor(): string;
    render(): import("lit-html").TemplateResult<1>;
    accessor active: boolean;
    accessor color: Color;
    accessor hollowCircle: boolean;
    accessor label: string | undefined;
    accessor theme: ColorScheme;
}
export declare class EdgelessColorPanel extends LitElement {
    static styles: import("lit").CSSResult;
    select(palette: Palette): void;
    get resolvedValue(): string | null;
    willUpdate(changedProperties: PropertyValues<this>): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor hasTransparent: boolean;
    accessor hollowCircle: boolean;
    accessor palettes: readonly Palette[];
    accessor theme: ColorScheme;
    accessor value: Color | null;
    accessor columns: number | undefined;
}
export declare class EdgelessTextColorIcon extends LitElement {
    static styles: import("lit").CSSResult;
    get preprocessColor(): string;
    render(): import("lit-html").TemplateResult<1>;
    accessor color: string;
}
//# sourceMappingURL=color-panel.d.ts.map