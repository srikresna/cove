import { Transformer, } from '@blocksuite/store';
export async function blobsFromAssets(assets, pathBlobIdMap = new Map()) {
    const sourcePathByBlobId = new Map();
    for (const [path, blobId] of pathBlobIdMap) {
        sourcePathByBlobId.set(blobId, path);
    }
    return Promise.all(Array.from(assets, async ([blobId, file]) => ({
        blobId,
        sourcePath: sourcePathByBlobId.get(blobId) ?? file.name,
        fileName: file.name,
        mime: file.type,
        bytes: new Uint8Array(await file.arrayBuffer()),
    })));
}
function copyToArrayBuffer(bytes) {
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    return copy.buffer;
}
export async function commitImportBatchToWorkspace(collection, schema, batch) {
    for (const blob of batch.blobs) {
        await collection.blobSync.set(blob.blobId, new File([copyToArrayBuffer(blob.bytes)], blob.fileName, {
            type: blob.mime,
        }));
    }
    const transformer = new Transformer({
        schema,
        blobCRUD: collection.blobSync,
        docCRUD: {
            create: (id) => collection.createDoc(id).getStore({ id }),
            get: (id) => collection.getDoc(id)?.getStore({ id }) ?? null,
            delete: (id) => collection.removeDoc(id),
        },
        middlewares: [],
    });
    const docIds = [];
    for (const doc of batch.docs) {
        const store = await transformer.snapshotToDoc(doc.snapshot);
        if (!store)
            continue;
        docIds.push(store.id);
        if (doc.meta && Object.keys(doc.meta).length) {
            collection.meta.setDocMeta(store.id, doc.meta);
        }
    }
    return {
        docIds,
        entryId: batch.entryId,
        isWorkspaceFile: batch.isWorkspaceFile,
        warnings: batch.warnings ?? [],
    };
}
