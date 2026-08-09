import { type Container } from '@blocksuite/global/di';
import { type BlockStdScope } from '@blocksuite/std';
import { Extension, type ExtensionType } from '@blocksuite/store';
import type { SlashMenuConfig } from './types';
export declare class SlashMenuExtension extends Extension {
    readonly std: BlockStdScope;
    config: SlashMenuConfig;
    static setup(di: Container): void;
    constructor(std: BlockStdScope);
}
export declare const SlashMenuConfigIdentifier: import("@blocksuite/global/di").ServiceIdentifier<SlashMenuConfig> & (<U extends SlashMenuConfig = SlashMenuConfig>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function SlashMenuConfigExtension(id: string, config: SlashMenuConfig): ExtensionType;
//# sourceMappingURL=extensions.d.ts.map