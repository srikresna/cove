import { CodeBlockModel, DocModes, ImageBlockModel, } from '@blocksuite/affine-model';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { BLOCK_ID_ATTR, BlockSelection, TextSelection, } from '@blocksuite/std';
import { fromJSON, } from '@blocksuite/store';
import * as Y from 'yjs';
import { REFERENCE_NODE } from '../../consts';
import { ImageSelection } from '../../selection';
import { ParseDocUrlProvider, TelemetryProvider, } from '../../services';
import { matchModels, referenceToNode } from '../../utils';
function findLastMatchingNode(root, fn) {
    let lastMatchingNode = null;
    function traverse(node) {
        if (fn(node)) {
            lastMatchingNode = node;
        }
        if (node.children) {
            for (const child of node.children) {
                traverse(child);
            }
        }
    }
    root.forEach(traverse);
    return lastMatchingNode;
}
// find last child that has text as prop
const findLast = (snapshot) => {
    return findLastMatchingNode(snapshot.content, node => !!node.props.text);
};
class PointState {
    constructor(std, point) {
        this.std = std;
        this.point = point;
        this._blockFromPath = (id) => {
            const block = this.std.view.getBlock(id);
            if (!block) {
                throw new BlockSuiteError(ErrorCode.TransformerError, `Block not found when pasting: ${id}`);
            }
            return block;
        };
        this.block = this._blockFromPath(point.blockId);
        this.model = this.block.model;
        const text = this.model.text;
        if (!text) {
            console.error(this.point);
            throw new BlockSuiteError(ErrorCode.TransformerError, 'Text point without text model');
        }
        this.text = text;
    }
}
class PasteTr {
    constructor(std, text, snapshot) {
        this.std = std;
        this.text = text;
        this.snapshot = snapshot;
        this._getDeltas = () => {
            const firstTextSnapshot = this._textFromSnapshot(this.firstSnapshot);
            const lastTextSnapshot = this._textFromSnapshot(this.lastSnapshot);
            const fromDelta = this.pointState.text.sliceToDelta(0, this.pointState.point.index);
            const toDelta = this.pointState.text.sliceToDelta(this.pointState.point.index + this.pointState.point.length, this.pointState.text.length);
            const firstDelta = firstTextSnapshot.delta;
            const lastDelta = lastTextSnapshot.delta;
            return {
                firstTextSnapshot,
                lastTextSnapshot,
                fromDelta,
                toDelta,
                firstDelta,
                lastDelta,
            };
        };
        this._mergeCode = () => {
            const deltas = [{ retain: this.pointState.point.index }];
            // if there is text selection, delete the text selected
            if (this.pointState.text.length - this.pointState.point.index > 0) {
                deltas.push({
                    delete: this.pointState.text.length - this.pointState.point.index,
                });
            }
            // paste the text from the snapshot to code block
            this.snapshot.content.forEach((blockSnapshot, i) => {
                if (blockSnapshot.props.text) {
                    const text = this._textFromSnapshot(blockSnapshot);
                    if (i > 0) {
                        deltas.push({ insert: '\n' });
                    }
                    deltas.push(...text.delta);
                }
            });
            // paste the text after the text selection from the snapshot to code block
            const { toDelta } = this._getDeltas();
            if (toDelta.length > 0) {
                deltas.push(...toDelta);
            }
            this.pointState.text.applyDelta(deltas);
            this.snapshot.content = [];
        };
        this._mergeMultiple = () => {
            this._updateFlavour();
            const { lastTextSnapshot, toDelta, firstDelta, lastDelta } = this._getDeltas();
            this.pointState.text.applyDelta([
                { retain: this.pointState.point.index },
                this.pointState.text.length - this.pointState.point.index > 0
                    ? { delete: this.pointState.text.length - this.pointState.point.index }
                    : {},
                ...firstDelta,
            ]);
            const removedFirstSnapshot = this.snapshot.content.shift();
            removedFirstSnapshot?.children.forEach(block => {
                this.snapshot.content.unshift(block);
            });
            this.pasteStartModelChildrenCount =
                removedFirstSnapshot?.children.length ?? 0;
            this._updateSnapshot();
            lastTextSnapshot.delta = [...lastDelta, ...toDelta];
        };
        this._mergeSingle = () => {
            this._updateFlavour();
            const { firstDelta } = this._getDeltas();
            const { index, length } = this.pointState.point;
            // Pastes a link
            if (length && firstDelta.length === 1 && firstDelta[0].attributes?.link) {
                this.pointState.text.format(index, length, firstDelta[0].attributes);
            }
            else {
                const ops = [{ retain: index }];
                if (length)
                    ops.push({ delete: length });
                ops.push(...firstDelta);
                this.pointState.text.applyDelta(ops);
            }
            this.snapshot.content.splice(0, 1);
            this._updateSnapshot();
        };
        this._textFromSnapshot = (snapshot) => {
            return (snapshot.props.text ?? { delta: [] });
        };
        this._updateSnapshot = () => {
            if (this.snapshot.content.length === 0) {
                this.firstSnapshot = this.lastSnapshot = undefined;
                return;
            }
            this.firstSnapshot = this.snapshot.content[0];
            this.lastSnapshot = findLast(this.snapshot) ?? this.firstSnapshot;
        };
        this.needCleanup = false;
        this.pasteStartModelChildrenCount = 0;
        this.canMerge = () => {
            if (this.snapshot.content.length === 0) {
                return false;
            }
            if (!this.firstSnapshot.props.text) {
                return false;
            }
            const firstTextSnapshot = this._textFromSnapshot(this.firstSnapshot);
            const lastTextSnapshot = this._textFromSnapshot(this.lastSnapshot);
            return (firstTextSnapshot &&
                lastTextSnapshot &&
                (this.pointState.text.length > 0 || this.firstSnapshotIsPlainText));
        };
        this.convertToLinkedDoc = () => {
            const parseDocUrlService = this.std.getOptional(ParseDocUrlProvider);
            if (!parseDocUrlService) {
                return;
            }
            const linkToDocId = new Map();
            for (const blockSnapshot of this.snapshot.content) {
                if (blockSnapshot.props.text) {
                    const [delta, transformed] = this._transformLinkDelta(this._textFromSnapshot(blockSnapshot).delta, linkToDocId, parseDocUrlService);
                    const model = this.std.store.getBlock(blockSnapshot.id)?.model;
                    if (transformed && model) {
                        this.std.store.captureSync();
                        this.std.store.transact(() => {
                            const text = model.text;
                            text.clear();
                            text.applyDelta(delta);
                        });
                    }
                }
            }
            const fromPointStateText = this.pointState.model.text;
            if (!fromPointStateText) {
                return;
            }
            const [delta, transformed] = this._transformLinkDelta(fromPointStateText.toDelta(), linkToDocId, parseDocUrlService);
            if (!transformed) {
                return;
            }
            this.std.store.captureSync();
            this.std.store.transact(() => {
                fromPointStateText.clear();
                fromPointStateText.applyDelta(delta);
            });
        };
        this.focusPasted = () => {
            const host = this.std.host;
            const cursorBlock = this.pointState.model.flavour === 'affine:code' || !this.lastSnapshot
                ? this.std.store.getBlock(this.pointState.model.id)
                : this.std.store.getBlock(this.lastSnapshot.id);
            if (!cursorBlock) {
                return;
            }
            const { model: cursorModel } = cursorBlock;
            host.updateComplete
                .then(() => {
                const target = this.std.host.querySelector(`[${BLOCK_ID_ATTR}="${cursorModel.id}"]`);
                if (!target) {
                    return;
                }
                if (!cursorModel.text) {
                    if (matchModels(cursorModel, [ImageBlockModel])) {
                        const selection = this.std.selection.create(ImageSelection, {
                            blockId: target.blockId,
                        });
                        this.std.selection.setGroup('note', [selection]);
                        return;
                    }
                    const selection = this.std.selection.create(BlockSelection, {
                        blockId: target.blockId,
                    });
                    this.std.selection.setGroup('note', [selection]);
                    return;
                }
                const selection = this.std.selection.create(TextSelection, {
                    from: {
                        blockId: target.blockId,
                        index: cursorModel.text ? this.lastIndex : 0,
                        length: 0,
                    },
                    to: null,
                });
                this.std.selection.setGroup('note', [selection]);
            })
                .catch(console.error);
        };
        this.pasted = () => {
            if (!(this.needCleanup || this.pointState.text.length === 0)) {
                return;
            }
            if (this.lastSnapshot) {
                const lastModel = this.std.store.getBlock(this.lastSnapshot.id)?.model;
                if (!lastModel) {
                    return;
                }
                this.std.store.moveBlocks(this.pointState.model.children, lastModel);
            }
            this.std.store.moveBlocks(this.std.store
                .getNexts(this.pointState.model.id)
                .slice(0, this.pasteStartModelChildrenCount), this.pointState.model);
            if (!this.firstSnapshotIsPlainText && this.pointState.text.length == 0) {
                this.std.store.deleteBlock(this.pointState.model);
            }
        };
        const { from } = text;
        this.pointState = new PointState(std, from);
        this.firstSnapshot = snapshot.content[0];
        this.lastSnapshot = findLast(snapshot) ?? this.firstSnapshot;
        if (this.firstSnapshot !== this.lastSnapshot &&
            this.lastSnapshot.props.text &&
            !matchModels(this.pointState.model, [CodeBlockModel])) {
            const text = fromJSON(this.lastSnapshot.props.text);
            const doc = new Y.Doc();
            const temp = doc.getMap('temp');
            temp.set('text', text.yText);
            this.lastIndex = text.length;
        }
        else {
            this.lastIndex =
                this.pointState.point.index +
                    this.snapshot.content
                        .map(snapshot => this._textFromSnapshot(snapshot)
                        .delta.map(op => {
                        if (op.insert) {
                            return op.insert.length;
                        }
                        else if (op.delete) {
                            return -op.delete;
                        }
                        else {
                            return 0;
                        }
                    })
                        .reduce((a, b) => a + b, 0))
                        .reduce((a, b) => a + b + 1, -1);
        }
        this.firstSnapshotIsPlainText =
            this.firstSnapshot.flavour === 'affine:paragraph' &&
                this.firstSnapshot.props.type === 'text';
    }
    _transformLinkDelta(delta, linkToDocId, parseDocUrlService) {
        let transformed = false;
        const needToConvert = new Map();
        for (const op of delta) {
            if (op.attributes?.link) {
                let docId = linkToDocId.get(op.attributes.link);
                if (!docId) {
                    const searchResult = parseDocUrlService.parseDocUrl(op.attributes.link);
                    if (searchResult) {
                        const doc = this.std.workspace.getDoc(searchResult.docId);
                        if (doc) {
                            docId = doc.id;
                            linkToDocId.set(op.attributes.link, doc.id);
                        }
                    }
                }
                if (docId) {
                    needToConvert.set(op, docId);
                }
            }
        }
        const newDelta = delta.map(op => {
            if (!needToConvert.has(op)) {
                return { ...op };
            }
            const link = op.attributes?.link;
            if (!link) {
                return { ...op };
            }
            const pageId = needToConvert.get(op);
            if (!pageId) {
                // External link
                this.std.getOptional(TelemetryProvider)?.track('Link', {
                    page: 'doc editor',
                    category: 'pasted link',
                    other: 'external link',
                    type: 'link',
                });
                return { ...op };
            }
            const reference = {
                pageId,
                type: 'LinkedPage',
            };
            // Title alias
            if (op.insert && op.insert !== REFERENCE_NODE && op.insert !== link) {
                reference.title = op.insert;
            }
            const extractedParams = extractSearchParams(link);
            const isLinkedBlock = extractedParams
                ? referenceToNode({ pageId, ...extractedParams })
                : false;
            Object.assign(reference, extractedParams);
            // Internal link
            this.std.getOptional(TelemetryProvider)?.track('LinkedDocCreated', {
                page: 'doc editor',
                category: 'pasted link',
                other: 'existing doc',
                type: isLinkedBlock ? 'block' : 'doc',
            });
            transformed = true;
            return {
                ...op,
                attributes: { reference },
                insert: REFERENCE_NODE,
            };
        });
        return [newDelta, transformed];
    }
    _updateFlavour() {
        this.firstSnapshot.flavour = this.pointState.model.flavour;
        if (this.firstSnapshot.props.type) {
            this.firstSnapshot.props.type = this.pointState.model.props.type;
        }
    }
    merge() {
        if (this.firstSnapshot === this.lastSnapshot) {
            this._mergeSingle();
            return;
        }
        if (this.pointState.model.flavour === 'affine:code') {
            this._mergeCode();
            return;
        }
        this.needCleanup = true;
        this._mergeMultiple();
    }
}
function flatNote(snapshot) {
    if (snapshot.content[0]?.flavour === 'affine:note') {
        snapshot.content = snapshot.content[0].children;
    }
}
export const pasteMiddleware = (std) => {
    return ({ slots }) => {
        let tr;
        const beforeImportSubscription = slots.beforeImport.subscribe(payload => {
            if (payload.type === 'slice') {
                const { snapshot } = payload;
                flatNote(snapshot);
                const text = std.selection.find(TextSelection);
                if (!text) {
                    return;
                }
                tr = new PasteTr(std, text, payload.snapshot);
                if (tr.canMerge()) {
                    tr.merge();
                }
            }
        });
        const afterImportSubscription = slots.afterImport.subscribe(payload => {
            if (tr && payload.type === 'slice') {
                tr.pasted();
                tr.focusPasted();
                tr.convertToLinkedDoc();
            }
        });
        return () => {
            beforeImportSubscription.unsubscribe();
            afterImportSubscription.unsubscribe();
        };
    };
};
function extractSearchParams(link) {
    try {
        const url = new URL(link);
        const mode = url.searchParams.get('mode');
        if (mode && DocModes.includes(mode)) {
            const params = { mode: mode };
            const blockIds = url.searchParams
                .get('blockIds')
                ?.trim()
                .split(',')
                .map(id => id.trim())
                .filter(id => id.length);
            const elementIds = url.searchParams
                .get('elementIds')
                ?.trim()
                .split(',')
                .map(id => id.trim())
                .filter(id => id.length);
            if (blockIds?.length) {
                params.blockIds = blockIds;
            }
            if (elementIds?.length) {
                params.elementIds = elementIds;
            }
            return { params };
        }
    }
    catch (err) {
        console.error(err);
    }
    return null;
}
