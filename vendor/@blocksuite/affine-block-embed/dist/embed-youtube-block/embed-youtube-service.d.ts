import { type EmbedYoutubeModel } from '@blocksuite/affine-model';
import { BlockService } from '@blocksuite/std';
export declare class EmbedYoutubeBlockService extends BlockService {
    static readonly flavour: `affine:embed-${string}`;
    queryUrlData: (embedYoutubeModel: EmbedYoutubeModel, signal?: AbortSignal) => Promise<Partial<import("@blocksuite/affine-model").EmbedYoutubeBlockUrlData>>;
}
export declare const EmbedYoutubeBlockOptionConfig: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=embed-youtube-service.d.ts.map