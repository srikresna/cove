import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { NoteBlockSchemaExtension } from '@blocksuite/affine-model';
import { z } from 'zod';
import { DocNoteBlockAdapterExtensions, EdgelessNoteBlockAdapterExtensions, } from './adapters';
const optionsSchema = z.object({
    mode: z.enum(['doc', 'edgeless']).optional(),
});
export class NoteStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-note-block';
        this.schema = optionsSchema;
    }
    setup(context, options) {
        super.setup(context);
        context.register(NoteBlockSchemaExtension);
        if (options?.mode === 'edgeless') {
            context.register(EdgelessNoteBlockAdapterExtensions);
        }
        else {
            context.register(DocNoteBlockAdapterExtensions);
        }
    }
}
