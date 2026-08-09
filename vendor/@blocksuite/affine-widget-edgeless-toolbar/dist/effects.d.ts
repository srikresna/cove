import { EdgelessToolIconButton } from './button/tool-icon-button';
import { EdgelessToolbarButton } from './button/toolbar-button';
import { EdgelessToolbarWidget } from './edgeless-toolbar';
import { EdgelessSlideMenu } from './menu/slide-menu';
import { ToolbarArrowUpIcon } from './menu/toolbar-arrow-up-icon';
import { EdgelessFontFamilyPanel } from './panel/font-family-panel';
import { EdgelessFontWeightAndStylePanel } from './panel/font-weight-and-style-panel';
export declare function effects(): void;
declare global {
    interface HTMLElementTagNameMap {
        'edgeless-tool-icon-button': EdgelessToolIconButton;
        'edgeless-toolbar-button': EdgelessToolbarButton;
        'edgeless-toolbar-widget': EdgelessToolbarWidget;
        'edgeless-font-weight-and-style-panel': EdgelessFontWeightAndStylePanel;
        'edgeless-font-family-panel': EdgelessFontFamilyPanel;
        'edgeless-slide-menu': EdgelessSlideMenu;
        'toolbar-arrow-up-icon': ToolbarArrowUpIcon;
    }
}
//# sourceMappingURL=effects.d.ts.map