import { FeatureFlagService, TelemetryProvider, } from '@blocksuite/affine-shared/services';
import { InteractivityExtension, } from '@blocksuite/std/gfx';
import { insertEdgelessTextCommand } from './commands';
import { addText } from './edgeless-text-editor';
export class DblClickAddEdgelessText extends InteractivityExtension {
    static { this.key = 'dbl-click-add-edgeless-text'; }
    mounted() {
        this.event.on('dblclick', (ctx) => {
            const { event: e } = ctx;
            const textFlag = this.std.store
                .get(FeatureFlagService)
                .getFlag('enable_edgeless_text');
            const picked = this.gfx.getElementByPoint(...this.gfx.viewport.toModelCoord(e.x, e.y));
            if (picked) {
                return;
            }
            if (textFlag) {
                const [x, y] = this.gfx.viewport.toModelCoord(e.x, e.y);
                this.std.command.exec(insertEdgelessTextCommand, { x, y });
            }
            else {
                const edgelessView = this.std.view.getBlock(this.std.store.root?.id || '');
                if (edgelessView) {
                    addText(edgelessView, e);
                }
            }
            this.std.getOptional(TelemetryProvider)?.track('CanvasElementAdded', {
                control: 'canvas:dbclick',
                page: 'whiteboard editor',
                module: 'toolbar',
                segment: 'toolbar',
                type: 'text',
            });
        });
    }
}
