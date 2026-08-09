import { AffineSchemas } from '@blocksuite/affine/schemas';
import { replaceIdMiddleware } from '@blocksuite/affine/shared/adapters';
import { Schema, Transformer, } from '@blocksuite/store';
export async function importFromSnapshot(collection, snapshot) {
    const job = new Transformer({
        schema: new Schema().register(AffineSchemas),
        blobCRUD: collection.blobSync,
        docCRUD: {
            create: (id) => collection.createDoc(id).getStore({ id }),
            get: (id) => collection.getDoc(id)?.getStore({ id }) ?? null,
            delete: (id) => collection.removeDoc(id),
        },
        middlewares: [replaceIdMiddleware(collection.idGenerator)],
    });
    return job.snapshotToDoc(snapshot);
}
