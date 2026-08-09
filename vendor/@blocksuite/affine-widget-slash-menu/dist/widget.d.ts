import { WidgetComponent } from '@blocksuite/std';
import type { SlashMenuConfig, SlashMenuItem } from './types';
export declare class AffineSlashMenuWidget extends WidgetComponent {
    private readonly _getInlineEditor;
    private readonly _handleInput;
    private readonly _onCompositionEnd;
    private readonly _onBeforeInput;
    get config(): SlashMenuConfig;
    configItemTransform: (item: SlashMenuItem) => SlashMenuItem;
    connectedCallback(): void;
}
//# sourceMappingURL=widget.d.ts.map