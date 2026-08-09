import type { EmbedCardStyle } from '@blocksuite/affine-model';
import type { Container } from '@blocksuite/global/di';
import { type BlockStdScope } from '@blocksuite/std';
import { Extension, type ExtensionType } from '@blocksuite/store';
export type EmbedOptions = {
    flavour: string;
    urlRegex: RegExp;
    styles: EmbedCardStyle[];
    viewType: 'card' | 'embed';
};
export interface EmbedOptionProvider {
    getEmbedBlockOptions(url: string): EmbedOptions | null;
    registerEmbedBlockOptions(options: EmbedOptions): void;
}
export declare const EmbedOptionProvider: import("@blocksuite/global/di").ServiceIdentifier<EmbedOptionProvider> & (<U extends EmbedOptionProvider = EmbedOptionProvider>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const EmbedOptionConfigIdentifier: import("@blocksuite/global/di").ServiceIdentifier<EmbedOptions> & (<U extends EmbedOptions = EmbedOptions>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const EmbedOptionConfig: (options: EmbedOptions) => ExtensionType;
export declare class EmbedOptionService extends Extension implements EmbedOptionProvider {
    readonly std: BlockStdScope;
    private readonly _embedBlockRegistry;
    constructor(std: BlockStdScope);
    getEmbedBlockOptions: (url: string) => EmbedOptions | null;
    registerEmbedBlockOptions: (options: EmbedOptions) => void;
    static setup(di: Container): void;
}
//# sourceMappingURL=embed-option-service.d.ts.map