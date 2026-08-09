import type { EmbedGithubBlockUrlData, EmbedGithubModel } from '@blocksuite/affine-model';
import type { LinkPreviewProvider } from '@blocksuite/affine-shared/services';
import { nothing } from 'lit';
import type { EmbedGithubBlockComponent } from './embed-github-block.js';
export declare function queryEmbedGithubData(embedGithubModel: EmbedGithubModel, linkPreviewer: LinkPreviewProvider, signal?: AbortSignal): Promise<Partial<EmbedGithubBlockUrlData>>;
export declare function queryEmbedGithubApiData(embedGithubModel: EmbedGithubModel, signal?: AbortSignal): Promise<Partial<EmbedGithubBlockUrlData>>;
export declare function refreshEmbedGithubUrlData(embedGithubElement: EmbedGithubBlockComponent, signal?: AbortSignal): Promise<void>;
export declare function refreshEmbedGithubStatus(embedGithubElement: EmbedGithubBlockComponent, signal?: AbortSignal): Promise<void>;
export declare function getGithubStatusIcon(type: 'issue' | 'pr', status: string, statusReason: string | null): import("lit-html").TemplateResult<1> | typeof nothing;
//# sourceMappingURL=utils.d.ts.map