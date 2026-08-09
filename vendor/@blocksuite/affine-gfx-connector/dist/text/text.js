import { DefaultTool, EdgelessCRUDIdentifier, } from '@blocksuite/affine-block-surface';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { Bound } from '@blocksuite/global/gfx';
import { GfxControllerIdentifier } from '@blocksuite/std/gfx';
import * as Y from 'yjs';
import { EdgelessConnectorLabelEditor } from './edgeless-connector-label-editor';
export function mountConnectorLabelEditor(connector, edgeless, point) {
    const mountElm = edgeless.querySelector('.edgeless-mount-point');
    if (!mountElm) {
        throw new BlockSuiteError(ErrorCode.ValueNotExists, "edgeless block's mount point does not exist");
    }
    const gfx = edgeless.std.get(GfxControllerIdentifier);
    gfx.tool.setTool(DefaultTool);
    gfx.selection.set({
        elements: [connector.id],
        editing: true,
    });
    if (!connector.text) {
        const text = new Y.Text();
        const labelOffset = connector.labelOffset;
        let labelXYWH = connector.labelXYWH ?? [0, 0, 16, 16];
        if (point) {
            const center = connector.getNearestPoint(point);
            const distance = connector.getOffsetDistanceByPoint(center);
            const bounds = Bound.fromXYWH(labelXYWH);
            bounds.center = center;
            labelOffset.distance = distance;
            labelXYWH = bounds.toXYWH();
        }
        edgeless.std.get(EdgelessCRUDIdentifier).updateElement(connector.id, {
            text,
            labelXYWH,
            labelOffset: { ...labelOffset },
        });
    }
    const editor = new EdgelessConnectorLabelEditor();
    editor.connector = connector;
    mountElm.append(editor);
    editor.updateComplete
        .then(() => {
        editor.inlineEditor?.focusEnd();
    })
        .catch(console.error);
}
