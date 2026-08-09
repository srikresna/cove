import type { BlockComponent } from '@blocksuite/std';
import { EmbedFigmaBlockComponent } from './embed-figma-block';
import { EmbedGithubBlockComponent } from './embed-github-block';
import { EmbedLoomBlockComponent } from './embed-loom-block';
import { EmbedYoutubeBlockComponent } from './embed-youtube-block';
export type ExternalEmbedBlockComponent = EmbedFigmaBlockComponent | EmbedGithubBlockComponent | EmbedLoomBlockComponent | EmbedYoutubeBlockComponent;
export declare function isExternalEmbedBlockComponent(block: BlockComponent): block is ExternalEmbedBlockComponent;
//# sourceMappingURL=types.d.ts.map