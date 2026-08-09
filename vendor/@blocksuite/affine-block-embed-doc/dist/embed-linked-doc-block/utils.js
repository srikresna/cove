import { EmbedEdgelessIcon, EmbedPageIcon, } from '@blocksuite/affine-components/icons';
import { ColorScheme, } from '@blocksuite/affine-model';
import { DarkSyncedDocErrorBanner, LightSyncedDocErrorBanner, } from '../embed-synced-doc-block/styles.js';
import { DarkLinkedEdgelessDeletedLargeBanner, DarkLinkedEdgelessDeletedSmallBanner, DarkLinkedEdgelessEmptyLargeBanner, DarkLinkedEdgelessEmptySmallBanner, DarkLinkedPageDeletedLargeBanner, DarkLinkedPageDeletedSmallBanner, DarkLinkedPageEmptyLargeBanner, DarkLinkedPageEmptySmallBanner, LightLinkedEdgelessDeletedLargeBanner, LightLinkedEdgelessDeletedSmallBanner, LightLinkedEdgelessEmptyLargeBanner, LightLinkedEdgelessEmptySmallBanner, LightLinkedPageDeletedLargeBanner, LightLinkedPageDeletedSmallBanner, LightLinkedPageEmptyLargeBanner, LightLinkedPageEmptySmallBanner, LinkedDocDeletedIcon, } from './styles.js';
export function getEmbedLinkedDocIcons(theme, editorMode, style) {
    const small = style !== 'vertical';
    if (editorMode === 'page') {
        if (theme === ColorScheme.Light) {
            return {
                LinkedDocIcon: EmbedPageIcon,
                LinkedDocDeletedIcon,
                LinkedDocEmptyBanner: small
                    ? LightLinkedPageEmptySmallBanner
                    : LightLinkedPageEmptyLargeBanner,
                LinkedDocDeletedBanner: small
                    ? LightLinkedPageDeletedSmallBanner
                    : LightLinkedPageDeletedLargeBanner,
                SyncedDocErrorBanner: LightSyncedDocErrorBanner,
            };
        }
        else {
            return {
                LinkedDocIcon: EmbedPageIcon,
                LinkedDocDeletedIcon,
                LinkedDocEmptyBanner: small
                    ? DarkLinkedPageEmptySmallBanner
                    : DarkLinkedPageEmptyLargeBanner,
                LinkedDocDeletedBanner: small
                    ? DarkLinkedPageDeletedSmallBanner
                    : DarkLinkedPageDeletedLargeBanner,
                SyncedDocErrorBanner: DarkSyncedDocErrorBanner,
            };
        }
    }
    else {
        if (theme === ColorScheme.Light) {
            return {
                LinkedDocIcon: EmbedEdgelessIcon,
                LinkedDocDeletedIcon,
                LinkedDocEmptyBanner: small
                    ? LightLinkedEdgelessEmptySmallBanner
                    : LightLinkedEdgelessEmptyLargeBanner,
                LinkedDocDeletedBanner: small
                    ? LightLinkedEdgelessDeletedSmallBanner
                    : LightLinkedEdgelessDeletedLargeBanner,
                SyncedDocErrorBanner: LightSyncedDocErrorBanner,
            };
        }
        else {
            return {
                LinkedDocIcon: EmbedEdgelessIcon,
                LinkedDocDeletedIcon,
                LinkedDocEmptyBanner: small
                    ? DarkLinkedEdgelessEmptySmallBanner
                    : DarkLinkedEdgelessEmptyLargeBanner,
                LinkedDocDeletedBanner: small
                    ? DarkLinkedEdgelessDeletedSmallBanner
                    : DarkLinkedEdgelessDeletedLargeBanner,
                SyncedDocErrorBanner: DarkSyncedDocErrorBanner,
            };
        }
    }
}
