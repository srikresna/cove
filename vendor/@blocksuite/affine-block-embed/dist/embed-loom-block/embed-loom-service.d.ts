import { type EmbedLoomModel } from '@blocksuite/affine-model';
import { BlockService } from '@blocksuite/std';
export declare class EmbedLoomBlockService extends BlockService {
    static readonly flavour: `affine:embed-${string}`;
    queryUrlData: (embedLoomModel: EmbedLoomModel, signal?: AbortSignal) => Promise<Partial<import("@blocksuite/affine-model").EmbedLoomBlockUrlData>>;
}
export declare const EmbedLoomBlockOptionConfig: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=embed-loom-service.d.ts.map