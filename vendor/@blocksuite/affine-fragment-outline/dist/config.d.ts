import type { EditorHost } from '@blocksuite/std';
import type { Signal } from '@preact/signals-core';
import type { TemplateResult } from 'lit';
export declare const previewIconMap: {
    code: TemplateResult<1>;
    numbered: TemplateResult<1>;
    bulleted: TemplateResult<1>;
    todo: TemplateResult<1>;
    toggle: TemplateResult<1>;
    bookmark: TemplateResult<1>;
    image: TemplateResult<1>;
    table: TemplateResult<1>;
    kanban: TemplateResult<1>;
    attachment: TemplateResult<1>;
    text: TemplateResult<1>;
    quote: TemplateResult<1>;
    h1: TemplateResult<1>;
    h2: TemplateResult<1>;
    h3: TemplateResult<1>;
    h4: TemplateResult<1>;
    h5: TemplateResult<1>;
    h6: TemplateResult<1>;
};
export declare const placeholderMap: {
    text: string;
    quote: string;
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    h5: string;
    h6: string;
    code: string;
    bulleted: string;
    numbered: string;
    toggle: string;
    todo: string;
    bookmark: string;
    image: string;
    database: string;
    attachment: string;
};
export declare const headingKeys: Set<string>;
export declare const outlineSettingsKey = "outlinePanelSettings";
export type TocContext = {
    editor$: Signal<EditorHost>;
    enableSorting$: Signal<boolean>;
    showIcons$: Signal<boolean>;
    fitPadding$: Signal<number[]>;
};
export declare const tocContext: {
    __context__: TocContext;
};
//# sourceMappingURL=config.d.ts.map