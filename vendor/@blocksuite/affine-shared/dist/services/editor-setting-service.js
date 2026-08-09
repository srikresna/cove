import { createIdentifier } from '@blocksuite/global/di';
import { z } from 'zod';
import { NodePropsSchema } from '../utils/index.js';
export const GeneralSettingSchema = z
    .object({
    edgelessScrollZoom: z.boolean().default(false),
    edgelessDisableScheduleUpdate: z.boolean().default(false),
    docCanvasPreferView: z
        .enum(['affine:embed-linked-doc', 'affine:embed-synced-doc'])
        .default('affine:embed-synced-doc'),
})
    .merge(NodePropsSchema);
export const EditorSettingProvider = createIdentifier('AffineEditorSettingProvider');
export function EditorSettingExtension(service) {
    return {
        setup: di => {
            di.override(EditorSettingProvider, () => service);
        },
    };
}
