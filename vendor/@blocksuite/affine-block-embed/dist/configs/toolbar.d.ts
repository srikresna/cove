import { type ExtensionType } from '@blocksuite/store';
import type { EmbedFigmaBlockComponent } from '../embed-figma-block';
import type { EmbedGithubBlockComponent } from '../embed-github-block';
import type { EmbedLoomBlockComponent } from '../embed-loom-block';
import type { EmbedYoutubeBlockComponent } from '../embed-youtube-block';
export declare const createBuiltinToolbarConfigExtension: (flavour: string, klass: typeof EmbedGithubBlockComponent | typeof EmbedFigmaBlockComponent | typeof EmbedLoomBlockComponent | typeof EmbedYoutubeBlockComponent) => ExtensionType[];
//# sourceMappingURL=toolbar.d.ts.map