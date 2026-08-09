import type { DocSnapshot } from '@blocksuite/store';
import type { Signal } from '@preact/signals-core';
export type AdapterItem = {
    id: string;
    label: string;
};
export declare const ADAPTERS: AdapterItem[];
export type AdapterPanelContext = {
    activeAdapter$: Signal<AdapterItem>;
    isHtmlPreview$: Signal<boolean>;
    docSnapshot$: Signal<DocSnapshot | null>;
    htmlContent$: Signal<string>;
    markdownContent$: Signal<string>;
    plainTextContent$: Signal<string>;
};
export declare const adapterPanelContext: {
    __context__: AdapterPanelContext;
};
//# sourceMappingURL=config.d.ts.map