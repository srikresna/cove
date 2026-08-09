import { getSurfaceBlock, } from '@blocksuite/affine-block-surface';
import { BlockSuiteError } from '@blocksuite/global/exceptions';
import { Bound, getCommonBound } from '@blocksuite/global/gfx';
import { assertType } from '@blocksuite/global/utils';
import { GfxControllerIdentifier } from '@blocksuite/std/gfx';
import { DocSnapshotSchema, } from '@blocksuite/store';
import { Subject } from 'rxjs';
import { createInsertPlaceMiddleware, createRegenerateIndexMiddleware, createStickerMiddleware, replaceIdMiddleware, } from './template-middlewares';
/**
 * Those block contains other block's id
 * should defer the loading
 */
const DEFERED_BLOCK = [
    'affine:surface',
    'affine:surface-ref',
    'affine:frame',
];
/**
 * Those block should not be inserted directly
 * it should be merged with current existing block
 */
const MERGE_BLOCK = ['affine:surface', 'affine:page'];
/**
 * Template type will affect the inserting behaviour
 */
const TEMPLATE_TYPES = ['template', 'sticker'];
export class TemplateJob {
    static { this.middlewares = []; }
    constructor({ model, type, middlewares }) {
        this._template = null;
        this.slots = {
            beforeInsert: new Subject(),
        };
        this.job = model.store.getTransformer();
        this.model = model;
        this.type = TEMPLATE_TYPES.includes(type)
            ? type
            : 'template';
        middlewares.forEach(middleware => middleware(this));
        TemplateJob.middlewares.forEach(middleware => middleware(this));
    }
    static create(options) {
        return new TemplateJob(options);
    }
    _getMergeBlockId(modelData) {
        switch (modelData.flavour) {
            case 'affine:page':
                return this.model.store.root.id;
            case 'affine:surface':
                return this.model.id;
        }
    }
    _getTemplateBound() {
        const bounds = [];
        this.walk(block => {
            if (block.props.xywh) {
                bounds.push(Bound.deserialize(block.props['xywh']));
            }
            if (block.flavour === 'affine:surface') {
                const ignoreType = new Set(['connector', 'group']);
                Object.entries(block.props.elements).forEach(([_, val]) => {
                    const type = val['type'];
                    if (val['xywh'] && !ignoreType.has(type)) {
                        bounds.push(Bound.deserialize(val['xywh']));
                    }
                    if (type === 'connector') {
                        ['target', 'source'].forEach(prop => {
                            const propVal = val[prop];
                            assertType(propVal);
                            if (propVal['id'] || !propVal['position'])
                                return;
                            const pos = propVal['position'];
                            if (pos) {
                                bounds.push(new Bound(pos[0], pos[1], 0, 0));
                            }
                        });
                    }
                });
            }
        });
        return getCommonBound(bounds);
    }
    _insertToDoc(modelDataList) {
        const doc = this.model.store;
        const mergeIdMapping = new Map();
        const deferInserting = [];
        const insert = (data, defered = true) => {
            const { flavour, json, modelData, parent, index } = data;
            const isMergeBlock = MERGE_BLOCK.includes(flavour);
            if (isMergeBlock) {
                mergeIdMapping.set(json.id, this._getMergeBlockId(json));
            }
            if (defered &&
                DEFERED_BLOCK.includes(flavour)) {
                deferInserting.push(data);
                return;
            }
            else {
                if (isMergeBlock) {
                    this._mergeProps(json, this.model.store.getModelById(this._getMergeBlockId(json)));
                    return;
                }
                if (!modelData) {
                    return;
                }
                doc.addBlock(modelData.flavour, {
                    ...modelData.props,
                    id: modelData.id,
                }, parent ? (mergeIdMapping.get(parent) ?? parent) : undefined, index);
            }
        };
        modelDataList.forEach(data => insert(data));
        deferInserting.forEach(data => insert(data, false));
    }
    async _jsonToModelData(json) {
        const job = this.job;
        const defered = [];
        const modelDataList = [];
        const toModel = async (snapshot, parent, index, defer = true) => {
            if (defer &&
                DEFERED_BLOCK.includes(snapshot.flavour)) {
                defered.push({
                    snapshot,
                    parent,
                    index,
                });
                return;
            }
            const slotData = {
                blockJson: snapshot,
                parent,
                index,
            };
            this.slots.beforeInsert.next({ type: 'block', data: slotData });
            /**
             * merge block should not be converted to model data
             */
            const modelData = MERGE_BLOCK.includes(snapshot.flavour)
                ? null
                : ((await job.snapshotToModelData(snapshot)) ?? null);
            modelDataList.push({
                flavour: snapshot.flavour,
                json: snapshot,
                modelData,
                parent,
                index,
            });
            if (snapshot.children) {
                let index = 0;
                for (const child of snapshot.children) {
                    await toModel(child, snapshot.id, index);
                    ++index;
                }
            }
        };
        await toModel(json);
        for (const json of defered) {
            await toModel(json.snapshot, json.parent, json.index, false);
        }
        return modelDataList;
    }
    _mergeProps(from, to) {
        switch (from.flavour) {
            case 'affine:page':
                break;
            case 'affine:surface':
                this._mergeSurfaceElements(from.props.elements, to.elements.getValue());
                break;
        }
    }
    _mergeSurfaceElements(from, to) {
        const schema = this.model.store.schema.get('affine:surface');
        const surfaceTransformer = schema?.transformer?.(new Map());
        this.model.store.transact(() => {
            const defered = [];
            Object.entries(from).forEach(([id, val]) => {
                if (['connector', 'group'].includes(val.type)) {
                    defered.push([id, val]);
                }
                else {
                    to.set(id, surfaceTransformer.elementFromJSON(val));
                }
            });
            defered.forEach(([key, val]) => {
                to.set(key, surfaceTransformer.elementFromJSON(val));
            });
        });
    }
    async insertTemplate(template) {
        DocSnapshotSchema.parse(template);
        assertType(template);
        this._template = template;
        const templateBound = this._getTemplateBound();
        this.slots.beforeInsert.next({
            type: 'template',
            template: template,
            bound: templateBound,
        });
        const modelDataList = await this._jsonToModelData(template.blocks);
        this._insertToDoc(modelDataList);
        return templateBound;
    }
    walk(callback) {
        if (!this._template) {
            throw new Error('Template not loaded, please call insertTemplate first');
        }
        const iterate = (block, template) => {
            callback(block, template);
            if (block.children) {
                block.children.forEach(child => iterate(child, template));
            }
        };
        iterate(this._template.blocks, this._template);
    }
}
export function createTemplateJob(std, type, center) {
    const surface = getSurfaceBlock(std.store);
    if (!surface) {
        throw new BlockSuiteError(BlockSuiteError.ErrorCode.NoSurfaceModelError, 'This doc is missing surface block in edgeless.');
    }
    const gfx = std.get(GfxControllerIdentifier);
    const middlewares = [];
    const { layer, viewport } = gfx;
    const blocks = layer.blocks;
    const elements = layer.canvasElements;
    if (type === 'template') {
        const bounds = [...blocks, ...elements].map(i => Bound.deserialize(i.xywh));
        const currentContentBound = getCommonBound(bounds);
        if (currentContentBound) {
            currentContentBound.x += currentContentBound.w + 20 / viewport.zoom;
            middlewares.push(createInsertPlaceMiddleware(currentContentBound));
        }
        const idxGenerator = layer.createIndexGenerator();
        middlewares.push(createRegenerateIndexMiddleware(() => idxGenerator()));
    }
    if (type === 'sticker') {
        middlewares.push(createStickerMiddleware(center || viewport.center, () => layer.generateIndex()));
    }
    middlewares.push(replaceIdMiddleware);
    return TemplateJob.create({
        model: surface,
        type,
        middlewares,
    });
}
