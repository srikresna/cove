import { EdgelessEraserToolButton } from './toolbar/components/eraser/eraser-tool-button';
import { EdgelessPenMenu } from './toolbar/components/pen/pen-menu';
import { EdgelessPenToolButton } from './toolbar/components/pen/pen-tool-button';
export declare function effects(): void;
declare global {
    interface HTMLElementTagNameMap {
        'edgeless-pen-menu': EdgelessPenMenu;
        'edgeless-pen-tool-button': EdgelessPenToolButton;
        'edgeless-eraser-tool-button': EdgelessEraserToolButton;
    }
}
//# sourceMappingURL=effects.d.ts.map