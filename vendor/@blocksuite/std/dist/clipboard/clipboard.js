import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import DOMPurify from 'dompurify';
import * as lz from 'lz-string';
import rehypeParse from 'rehype-parse';
import { unified } from 'unified';
import { LifeCycleWatcher } from '../extension/index.js';
import { ClipboardAdapterConfigIdentifier } from './clipboard-adapter.js';
import { onlyContainImgElement } from './utils.js';
export class Clipboard extends LifeCycleWatcher {
    constructor() {
        super(...arguments);
        // Need to be cloned to a map for later use
        this._getDataByType = (clipboardData) => {
            const data = new Map();
            for (const type of clipboardData.types) {
                if (type === 'Files') {
                    data.set(type, Array.from(clipboardData.files));
                }
                else {
                    data.set(type, clipboardData.getData(type));
                }
            }
            if (data.get('Files') && data.get('text/html')) {
                const htmlAst = unified()
                    .use(rehypeParse)
                    .parse(data.get('text/html'));
                const isImgOnly = htmlAst.children.map(onlyContainImgElement).reduce((a, b) => {
                    if (a === 'no' || b === 'no') {
                        return 'no';
                    }
                    if (a === 'maybe' && b === 'maybe') {
                        return 'maybe';
                    }
                    return 'yes';
                }, 'maybe') === 'yes';
                if (isImgOnly) {
                    data.delete('text/html');
                }
            }
            return (type) => {
                const item = data.get(type);
                if (item) {
                    return item;
                }
                const files = (data.get('Files') ?? []);
                if (files.length > 0) {
                    return files;
                }
                return '';
            };
        };
        this._getSnapshotByPriority = async (getItem, doc, parent, index) => {
            const byPriority = Array.from(this._adapters).sort((a, b) => b.priority - a.priority);
            for (const { adapter, mimeType } of byPriority) {
                const item = getItem(mimeType);
                if (Array.isArray(item)) {
                    if (item.length === 0) {
                        continue;
                    }
                    if (
                    // if all files are not the same target type, fallback to */*
                    !item
                        .map(f => f.type === mimeType || mimeType === '*/*')
                        .reduce((a, b) => a && b, true)) {
                        continue;
                    }
                }
                if (item) {
                    const job = this._getJob();
                    const adapterInstance = new adapter(job, this.std.store.provider);
                    const payload = {
                        file: item,
                        assets: job.assetsManager,
                        workspaceId: doc.workspace.id,
                        pageId: doc.id,
                    };
                    const result = await adapterInstance.toSlice(payload, doc, parent, index);
                    if (result) {
                        return result;
                    }
                }
            }
            return null;
        };
        this._jobMiddlewares = [];
        this.copy = async (slice) => {
            return this.copySlice(slice);
        };
        // Gated by https://developer.mozilla.org/en-US/docs/Glossary/Transient_activation
        this.copySlice = async (slice) => {
            const adapterKeys = this._adapters.map(adapter => adapter.mimeType);
            await this.writeToClipboard(async (items) => {
                const filtered = (await Promise.all(adapterKeys.map(async (type) => {
                    const item = await this._getClipboardItem(slice, type);
                    if (typeof item === 'string') {
                        return [type, item];
                    }
                    return null;
                }))).filter((adapter) => Boolean(adapter));
                return {
                    ...items,
                    ...Object.fromEntries(filtered),
                };
            });
        };
        this.duplicateSlice = async (slice, doc, parent, index, type = 'BLOCKSUITE/SNAPSHOT') => {
            const items = {
                [type]: await this._getClipboardItem(slice, type),
            };
            await this._getSnapshotByPriority(type => items[type] ?? '', doc, parent, index);
        };
        this.paste = async (event, doc, parent, index) => {
            const data = event.clipboardData;
            if (!data) {
                return;
            }
            try {
                const json = this.readFromClipboard(data);
                const slice = await this._getSnapshotByPriority(type => json[type], doc, parent, index);
                if (!slice) {
                    throw new BlockSuiteError(ErrorCode.TransformerError, 'No snapshot found');
                }
                return slice;
            }
            catch {
                const getDataByType = this._getDataByType(data);
                const slice = await this._getSnapshotByPriority(type => getDataByType(type), doc, parent, index);
                return slice;
            }
        };
        this.pasteBlockSnapshot = async (snapshot, doc, parent, index) => {
            return this._getJob().snapshotToBlock(snapshot, doc, parent, index);
        };
        this.unuse = (middleware) => {
            this._jobMiddlewares = this._jobMiddlewares.filter(m => m !== middleware);
        };
        this.use = (middleware) => {
            this._jobMiddlewares.push(middleware);
        };
    }
    static { this.key = 'clipboard'; }
    get _adapters() {
        const adapterConfigs = this.std.provider.getAll(ClipboardAdapterConfigIdentifier);
        return Array.from(adapterConfigs.values());
    }
    get configs() {
        return this._getJob().adapterConfigs;
    }
    async _getClipboardItem(slice, type) {
        const job = this._getJob();
        const adapterItem = this.std.getOptional(ClipboardAdapterConfigIdentifier(type));
        if (!adapterItem) {
            return;
        }
        const { adapter } = adapterItem;
        const adapterInstance = new adapter(job, this.std.store.provider);
        const result = await adapterInstance.fromSlice(slice);
        if (!result) {
            return;
        }
        return result.file;
    }
    _getJob() {
        return this.std.store.getTransformer(this._jobMiddlewares);
    }
    readFromClipboard(clipboardData) {
        const items = clipboardData.getData('text/html');
        const sanitizedItems = DOMPurify.sanitize(items);
        const domParser = new DOMParser();
        const doc = domParser.parseFromString(sanitizedItems, 'text/html');
        const dom = doc.querySelector('[data-blocksuite-snapshot]');
        if (!dom) {
            throw new BlockSuiteError(ErrorCode.TransformerError, 'No snapshot found');
        }
        const json = JSON.parse(lz.decompressFromEncodedURIComponent(dom.dataset.blocksuiteSnapshot));
        return json;
    }
    sliceToSnapshot(slice) {
        const job = this._getJob();
        return job.sliceToSnapshot(slice);
    }
    async writeToClipboard(updateItems) {
        const items = await updateItems({
            'text/plain': '',
            'text/html': '',
            'image/png': '',
        });
        const text = items['text/plain'] ?? '';
        const innerHTML = items['text/html'] ?? '';
        const image = items['image/png'];
        delete items['text/plain'];
        delete items['text/html'];
        const clipboardItems = {};
        if (image) {
            const type = 'image/png';
            delete items[type];
            if (typeof image === 'string') {
                clipboardItems[type] = new Blob([image], { type });
            }
            else if (image instanceof Blob) {
                clipboardItems[type] = image;
            }
        }
        if (text.length > 0) {
            const type = 'text/plain';
            clipboardItems[type] = new Blob([text], { type });
        }
        const hasInnerHTML = Boolean(innerHTML.length);
        const isEmpty = Object.keys(clipboardItems).length === 0;
        // If there are no items, fall back to snapshot.
        if (hasInnerHTML || isEmpty) {
            const type = 'text/html';
            const snapshot = lz.compressToEncodedURIComponent(JSON.stringify(items));
            const html = `<div data-blocksuite-snapshot="${snapshot}">${innerHTML}</div>`;
            clipboardItems[type] = new Blob([html], { type });
        }
        await navigator.clipboard.write([new ClipboardItem(clipboardItems)]);
    }
}
