import { EdgelessConnectorHandle } from './components/connector-handle';
import { EdgelessConnectorLabelEditor } from './text/edgeless-connector-label-editor';
import { EdgelessConnectorMenu } from './toolbar/connector-menu';
import { EdgelessConnectorToolButton } from './toolbar/connector-tool-button';
export declare function effects(): void;
declare global {
    interface HTMLElementTagNameMap {
        'edgeless-connector-tool-button': EdgelessConnectorToolButton;
        'edgeless-connector-menu': EdgelessConnectorMenu;
        'edgeless-connector-label-editor': EdgelessConnectorLabelEditor;
        'edgeless-connector-handle': EdgelessConnectorHandle;
    }
}
//# sourceMappingURL=effects.d.ts.map