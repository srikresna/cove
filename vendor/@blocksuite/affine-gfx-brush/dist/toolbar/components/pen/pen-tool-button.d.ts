import { EditPropsStore } from '@blocksuite/affine-shared/services';
import { LitElement } from 'lit';
import { BrushTool } from '../../../brush-tool';
import { HighlighterTool } from '../../../highlighter-tool';
declare const EdgelessPenToolButton_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/affine-widget-edgeless-toolbar").EdgelessToolbarToolClass>;
export declare class EdgelessPenToolButton extends EdgelessPenToolButton_base {
    static styles: import("lit").CSSResult;
    get themeProvider(): import("@blocksuite/affine-shared/services").ThemeService;
    get settings(): EditPropsStore;
    private readonly colors$;
    private readonly color$;
    private readonly lineWidths$;
    private readonly lineWidth$;
    private readonly penIconMap$;
    private readonly penIcon$;
    private readonly penInfo$;
    private readonly pen$;
    enableActiveBackground: boolean;
    type: (typeof BrushTool | typeof HighlighterTool)[];
    firstUpdated(): void;
    private _togglePenMenu;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
//# sourceMappingURL=pen-tool-button.d.ts.map