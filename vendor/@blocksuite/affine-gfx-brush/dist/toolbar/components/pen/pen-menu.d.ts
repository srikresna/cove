import { type ReadonlySignal, type Signal } from '@preact/signals-core';
import { LitElement, type TemplateResult } from 'lit';
import { BrushTool } from '../../../brush-tool';
import { HighlighterTool } from '../../../highlighter-tool';
import type { Pen, PenMap } from './types';
declare const EdgelessPenMenu_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/affine-widget-edgeless-toolbar").EdgelessToolbarToolClass>;
export declare class EdgelessPenMenu extends EdgelessPenMenu_base {
    static styles: import("lit").CSSResult;
    private readonly _theme$;
    private readonly _onPickPen;
    private readonly _onPickColor;
    private readonly _onPickLineWidth;
    type: (typeof BrushTool | typeof HighlighterTool)[];
    render(): TemplateResult<1>;
    accessor onChange: (props: Record<string, unknown>) => void;
    accessor colors$: ReadonlySignal<PenMap<string>>;
    accessor penIconMap$: ReadonlySignal<PenMap<TemplateResult>>;
    accessor pen$: Signal<Pen>;
    accessor penInfo$: ReadonlySignal<{
        type: Pen;
        color: string;
        icon: TemplateResult<1>;
        lineWidth: number;
        tip: string;
        shortcut: string;
    }>;
}
export {};
//# sourceMappingURL=pen-menu.d.ts.map