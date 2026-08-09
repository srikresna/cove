import { FileDropExtension } from '@blocksuite/affine-components/drop-indicator';
import { PeekViewExtension, } from '@blocksuite/affine-components/peek';
import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { AutoClearSelectionService, BlockElementCommentManager, CitationService, DefaultOpenDocExtension, DNDAPIExtension, DocDisplayMetaService, DocModeService, EditPropsStore, EmbedOptionService, FileSizeLimitService, FontConfigExtension, fontConfigSchema, FontLoaderService, LinkPreviewCache, LinkPreviewCacheConfigSchema, LinkPreviewCacheExtension, LinkPreviewService, PageViewportServiceExtension, TelemetryExtension, ThemeService, ToolbarRegistryExtension, } from '@blocksuite/affine-shared/services';
import { InteractivityManager, ToolController } from '@blocksuite/std/gfx';
import { z } from 'zod';
import { clipboardConfigs } from './clipboard';
import { effects } from './effects';
const optionsSchema = z.object({
    linkPreviewCacheConfig: z.optional(LinkPreviewCacheConfigSchema),
    fontConfig: z.optional(z.array(fontConfigSchema)),
    telemetry: z.optional(z.custom()),
    peekView: z.optional(z.custom()),
});
export class FoundationViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'foundation';
        this.schema = optionsSchema;
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context, options) {
        super.setup(context, options);
        context.register([
            DocDisplayMetaService,
            EditPropsStore,
            DefaultOpenDocExtension,
            FontLoaderService,
            DocModeService,
            ThemeService,
            EmbedOptionService,
            PageViewportServiceExtension,
            DNDAPIExtension,
            FileDropExtension,
            ToolbarRegistryExtension,
            AutoClearSelectionService,
            FileSizeLimitService,
            LinkPreviewCache,
            LinkPreviewService,
            CitationService,
            BlockElementCommentManager,
        ]);
        context.register(clipboardConfigs);
        if (this.isEdgeless(context.scope)) {
            context.register([InteractivityManager, ToolController]);
        }
        const fontConfig = options?.fontConfig;
        if (fontConfig) {
            context.register(FontConfigExtension(fontConfig));
        }
        const linkPreviewCacheConfig = options?.linkPreviewCacheConfig;
        if (linkPreviewCacheConfig) {
            context.register(LinkPreviewCacheExtension(linkPreviewCacheConfig));
        }
        const telemetry = options?.telemetry;
        if (telemetry) {
            context.register(TelemetryExtension(telemetry));
        }
        const peekView = options?.peekView;
        if (peekView) {
            context.register(PeekViewExtension(peekView));
        }
    }
}
