import type { DocMode } from '@blocksuite/affine-model';
import { HighlightSelection } from '@blocksuite/affine-shared/selection';
import { Bound } from '@blocksuite/global/gfx';
import { WidgetComponent } from '@blocksuite/std';
import { nothing } from 'lit';
type Anchor = {
    id: string;
    mode: DocMode;
    highlight: boolean;
};
export declare const AFFINE_SCROLL_ANCHORING_WIDGET = "affine-scroll-anchoring-widget";
export declare class AffineScrollAnchoringWidget extends WidgetComponent {
    #private;
    static styles: import("lit").CSSResult;
    anchor$: import("@preact/signals-core").Signal<Anchor | null>;
    anchorBounds$: import("@preact/signals-core").Signal<Bound | null>;
    highlighted$: import("@preact/signals-core").ReadonlySignal<HighlightSelection | undefined>;
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
}
export {};
//# sourceMappingURL=scroll-anchoring.d.ts.map