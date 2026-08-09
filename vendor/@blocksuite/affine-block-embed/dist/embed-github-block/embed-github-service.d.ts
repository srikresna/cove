import { type EmbedGithubModel } from '@blocksuite/affine-model';
import { BlockService } from '@blocksuite/std';
export declare class EmbedGithubBlockService extends BlockService {
    static readonly flavour: `affine:embed-${string}`;
    queryApiData: (embedGithubModel: EmbedGithubModel, signal?: AbortSignal) => Promise<Partial<import("@blocksuite/affine-model").EmbedGithubBlockUrlData>>;
    queryUrlData: (embedGithubModel: EmbedGithubModel, signal?: AbortSignal) => Promise<Partial<import("@blocksuite/affine-model").EmbedGithubBlockUrlData>>;
}
export declare const EmbedGithubBlockOptionConfig: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=embed-github-service.d.ts.map