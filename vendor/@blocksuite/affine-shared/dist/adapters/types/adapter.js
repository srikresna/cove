import { createIdentifier } from '@blocksuite/global/di';
import { BlockSnapshotSchema, } from '@blocksuite/store';
export const isBlockSnapshotNode = (node) => BlockSnapshotSchema.safeParse(node).success;
export const AdapterFactoryIdentifier = createIdentifier('AdapterFactory');
