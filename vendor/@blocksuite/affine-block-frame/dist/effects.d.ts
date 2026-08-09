import { EdgelessFrameMenu, EdgelessFrameToolButton } from './edgeless-toolbar';
import { PresentationToolbar } from './edgeless-toolbar/presentation-toolbar';
import { FrameBlockComponent } from './frame-block';
import { EdgelessFrameOrderButton } from './present/frame-order-button';
import { EdgelessFrameOrderMenu } from './present/frame-order-menu';
import { EdgelessNavigatorBlackBackgroundWidget } from './present/navigator-bg-widget';
import { EdgelessNavigatorSettingButton } from './present/navigator-setting-button';
import { EdgelessPresentButton } from './present/present-button';
export declare function effects(): void;
declare global {
    interface HTMLElementTagNameMap {
        'affine-frame': FrameBlockComponent;
        'edgeless-frame-tool-button': EdgelessFrameToolButton;
        'edgeless-frame-menu': EdgelessFrameMenu;
        'edgeless-frame-order-button': EdgelessFrameOrderButton;
        'edgeless-frame-order-menu': EdgelessFrameOrderMenu;
        'edgeless-navigator-setting-button': EdgelessNavigatorSettingButton;
        'edgeless-present-button': EdgelessPresentButton;
        'presentation-toolbar': PresentationToolbar;
        'edgeless-navigator-black-background': EdgelessNavigatorBlackBackgroundWidget;
    }
}
//# sourceMappingURL=effects.d.ts.map