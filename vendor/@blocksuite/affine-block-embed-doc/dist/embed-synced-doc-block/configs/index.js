import { EmbedSyncedDocBlockSchema, } from '@blocksuite/affine-model';
import { ConfigExtensionFactory } from '@blocksuite/std';
export const EmbedSyncedDocConfigExtension = ConfigExtensionFactory(EmbedSyncedDocBlockSchema.model.flavour);
