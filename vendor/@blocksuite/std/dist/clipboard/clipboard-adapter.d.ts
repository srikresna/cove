import { type ServiceProvider } from '@blocksuite/global/di';
import type { BaseAdapter, ExtensionType, Transformer } from '@blocksuite/store';
type AdapterConstructor = new (job: Transformer, provider: ServiceProvider) => BaseAdapter;
export interface ClipboardAdapterConfig {
    mimeType: string;
    priority: number;
    adapter: AdapterConstructor;
}
export declare const ClipboardAdapterConfigIdentifier: import("@blocksuite/global/di").ServiceIdentifier<ClipboardAdapterConfig> & (<U extends ClipboardAdapterConfig = ClipboardAdapterConfig>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function ClipboardAdapterConfigExtension(config: ClipboardAdapterConfig): ExtensionType;
export {};
//# sourceMappingURL=clipboard-adapter.d.ts.map