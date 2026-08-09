import { type ExtensionType } from '@blocksuite/store';
import type { TemplateResult } from 'lit';
export type OpenDocMode = 'open-in-active-view' | 'open-in-new-view' | 'open-in-new-tab' | 'open-in-center-peek';
export interface OpenDocConfigItem {
    type: OpenDocMode;
    label: string;
    icon: TemplateResult<1>;
}
export interface OpenDocConfig {
    items: OpenDocConfigItem[];
}
export interface OpenDocService {
    isAllowed: (mode: OpenDocMode) => boolean;
    items: OpenDocConfig['items'];
}
export declare const OpenDocExtensionIdentifier: import("@blocksuite/global/di").ServiceIdentifier<OpenDocService> & (<U extends OpenDocService = OpenDocService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const OpenDocExtension: (config: OpenDocConfig) => ExtensionType;
export declare const DefaultOpenDocExtension: ExtensionType;
//# sourceMappingURL=open-doc-config.d.ts.map