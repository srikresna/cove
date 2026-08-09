import type { ServiceProvider } from '@blocksuite/global/di';
import { BaseAdapter, type BlockSnapshot, type DocSnapshot, type FromBlockSnapshotPayload, type FromBlockSnapshotResult, type FromDocSnapshotPayload, type FromDocSnapshotResult, type FromSliceSnapshotPayload, type FromSliceSnapshotResult, type SliceSnapshot, type ToBlockSnapshotPayload, type ToDocSnapshotPayload, type ToSliceSnapshotPayload, type Transformer } from '@blocksuite/store';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
export type PdfAdapterFile = {
    blob: Blob;
    fileName: string;
};
/**
 * PDF export adapter using pdfmake library.
 *
 * This adapter converts BlockSuite documents to PDF format. It is export-only
 * and does not support importing from PDF.
 *
 * @example
 * ```typescript
 * const adapter = new PdfAdapter(job, provider);
 * const result = await adapter.fromDocSnapshot({ snapshot, assets });
 * download(result.file.blob, result.file.fileName);
 * ```
 */
export declare class PdfAdapter extends BaseAdapter<PdfAdapterFile> {
    constructor(job: Transformer, provider: ServiceProvider);
    fromBlockSnapshot({ snapshot, assets, }: FromBlockSnapshotPayload): Promise<FromBlockSnapshotResult<PdfAdapterFile>>;
    fromDocSnapshot({ snapshot, assets, }: FromDocSnapshotPayload): Promise<FromDocSnapshotResult<PdfAdapterFile>>;
    fromSliceSnapshot({ snapshot, assets, }: FromSliceSnapshotPayload): Promise<FromSliceSnapshotResult<PdfAdapterFile>>;
    toBlockSnapshot(_payload: ToBlockSnapshotPayload<PdfAdapterFile>): BlockSnapshot;
    toDocSnapshot(_payload: ToDocSnapshotPayload<PdfAdapterFile>): DocSnapshot;
    toSliceSnapshot(_payload: ToSliceSnapshotPayload<PdfAdapterFile>): SliceSnapshot | null;
    /**
     * Get the pdfmake document definition (for testing purposes)
     */
    getDocDefinition(blocks: BlockSnapshot[], title?: string, assets?: FromDocSnapshotPayload['assets']): Promise<TDocumentDefinitions>;
    private _buildContent;
    private _blockToContent;
    private _createParagraphContent;
    private _createQuoteContent;
    private _createListContent;
    private _createCodeContent;
    private _createCalloutContent;
    private _createDatabaseContent;
    private _adjustMargins;
    private _createLinkedDocContent;
    private _createImageContent;
    private _createTableContent;
    private _processChildrenWithMargins;
    private _getImagePlaceholderContent;
    private _createDocDefinition;
    private _createPdfBlob;
}
//# sourceMappingURL=pdf.d.ts.map