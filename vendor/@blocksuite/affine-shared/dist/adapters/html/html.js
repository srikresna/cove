import { DefaultTheme, NoteDisplayMode } from '@blocksuite/affine-model';
import { ASTWalker, BaseAdapter, BlockSnapshotSchema, nanoid, } from '@blocksuite/store';
import DOMPurify from 'dompurify';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';
import { AdapterFactoryIdentifier, } from '../types';
import { HastUtils } from '../utils/hast';
import { BlockHtmlAdapterMatcherIdentifier, } from './block-adapter';
import { HtmlASTToDeltaMatcherIdentifier, HtmlDeltaConverter, InlineDeltaToHtmlAdapterMatcherIdentifier, } from './delta-converter';
import { rehypeInlineToBlock, rehypeWrapInlineElements, } from './rehype-plugins';
export class HtmlAdapter extends BaseAdapter {
    constructor(job, provider) {
        super(job, provider);
        this._astToHtml = (ast) => {
            return unified().use(rehypeStringify).stringify(ast);
        };
        this._traverseHtml = async (html, snapshot, assets) => {
            const walker = new ASTWalker();
            walker.setONodeTypeGuard((node) => 'type' in node && node.type !== undefined);
            walker.setEnter(async (o, context) => {
                for (const matcher of this.blockMatchers) {
                    if (matcher.toMatch(o)) {
                        const adapterContext = {
                            walker,
                            walkerContext: context,
                            configs: this.configs,
                            job: this.job,
                            deltaConverter: this.deltaConverter,
                            textBuffer: { content: '' },
                            assets,
                        };
                        await matcher.toBlockSnapshot.enter?.(o, adapterContext);
                    }
                }
            });
            walker.setLeave(async (o, context) => {
                for (const matcher of this.blockMatchers) {
                    if (matcher.toMatch(o)) {
                        const adapterContext = {
                            walker,
                            walkerContext: context,
                            configs: this.configs,
                            job: this.job,
                            deltaConverter: this.deltaConverter,
                            textBuffer: { content: '' },
                            assets,
                        };
                        await matcher.toBlockSnapshot.leave?.(o, adapterContext);
                    }
                }
            });
            return walker.walk(html, snapshot);
        };
        this._traverseSnapshot = async (snapshot, html, assets) => {
            const assetsIds = [];
            const walker = new ASTWalker();
            walker.setONodeTypeGuard((node) => BlockSnapshotSchema.safeParse(node).success);
            walker.setEnter(async (o, context) => {
                for (const matcher of this.blockMatchers) {
                    if (matcher.fromMatch(o)) {
                        const adapterContext = {
                            walker,
                            walkerContext: context,
                            configs: this.configs,
                            job: this.job,
                            deltaConverter: this.deltaConverter,
                            provider: this.provider,
                            textBuffer: { content: '' },
                            assets,
                            updateAssetIds: (assetsId) => {
                                assetsIds.push(assetsId);
                            },
                        };
                        await matcher.fromBlockSnapshot.enter?.(o, adapterContext);
                    }
                }
            });
            walker.setLeave(async (o, context) => {
                for (const matcher of this.blockMatchers) {
                    if (matcher.fromMatch(o)) {
                        const adapterContext = {
                            walker,
                            walkerContext: context,
                            configs: this.configs,
                            job: this.job,
                            deltaConverter: this.deltaConverter,
                            provider: this.provider,
                            textBuffer: { content: '' },
                            assets,
                        };
                        await matcher.fromBlockSnapshot.leave?.(o, adapterContext);
                    }
                }
            });
            return {
                ast: (await walker.walk(snapshot, html)),
                assetsIds,
            };
        };
        const blockMatchers = Array.from(provider.getAll(BlockHtmlAdapterMatcherIdentifier).values());
        const inlineDeltaToHtmlAdapterMatchers = Array.from(provider.getAll(InlineDeltaToHtmlAdapterMatcherIdentifier).values());
        const htmlInlineToDeltaMatchers = Array.from(provider.getAll(HtmlASTToDeltaMatcherIdentifier).values());
        this.blockMatchers = blockMatchers;
        this.deltaConverter = new HtmlDeltaConverter(job.adapterConfigs, inlineDeltaToHtmlAdapterMatchers, htmlInlineToDeltaMatchers, provider);
    }
    _htmlToAst(html) {
        const processor = unified()
            .use(rehypeParse)
            .use(rehypeInlineToBlock)
            .use(rehypeWrapInlineElements);
        const ast = processor.parse(html);
        return processor.runSync(ast);
    }
    async fromBlockSnapshot(payload) {
        const root = {
            type: 'root',
            children: [
                {
                    type: 'doctype',
                },
            ],
        };
        const { ast, assetsIds } = await this._traverseSnapshot(payload.snapshot, root, payload.assets);
        return {
            file: this._astToHtml(ast),
            assetsIds,
        };
    }
    async fromDocSnapshot(payload) {
        const { file, assetsIds } = await this.fromBlockSnapshot({
            snapshot: payload.snapshot.blocks,
            assets: payload.assets,
        });
        return {
            file: file.replace('<!--BlockSuiteDocTitlePlaceholder-->', `<h1>${payload.snapshot.meta.title}</h1>`),
            assetsIds,
        };
    }
    async fromSliceSnapshot(payload) {
        let buffer = '';
        const sliceAssetsIds = [];
        for (const contentSlice of payload.snapshot.content) {
            const root = {
                type: 'root',
                children: [],
            };
            const { ast, assetsIds } = await this._traverseSnapshot(contentSlice, root, payload.assets);
            sliceAssetsIds.push(...assetsIds);
            buffer += this._astToHtml(ast);
        }
        const html = buffer;
        return {
            file: html,
            assetsIds: sliceAssetsIds,
        };
    }
    toBlockSnapshot(payload) {
        const htmlAst = this._htmlToAst(payload.file);
        const blockSnapshotRoot = {
            type: 'block',
            id: nanoid(),
            flavour: 'affine:note',
            props: {
                xywh: '[0,0,800,95]',
                background: DefaultTheme.noteBackgrounColor,
                index: 'a0',
                hidden: false,
                displayMode: NoteDisplayMode.DocAndEdgeless,
            },
            children: [],
        };
        return this._traverseHtml(htmlAst, blockSnapshotRoot, payload.assets);
    }
    async toDocSnapshot(payload) {
        const sanitized = DOMPurify.sanitize(payload.file);
        const htmlAst = this._htmlToAst(sanitized);
        const titleAst = HastUtils.querySelector(htmlAst, 'title');
        const blockSnapshotRoot = {
            type: 'block',
            id: nanoid(),
            flavour: 'affine:note',
            props: {
                xywh: '[0,0,800,95]',
                background: DefaultTheme.noteBackgrounColor,
                index: 'a0',
                hidden: false,
                displayMode: NoteDisplayMode.DocAndEdgeless,
            },
            children: [],
        };
        return {
            type: 'page',
            meta: {
                id: nanoid(),
                title: HastUtils.getTextContent(titleAst, 'Untitled'),
                createDate: Date.now(),
                tags: [],
            },
            blocks: {
                type: 'block',
                id: nanoid(),
                flavour: 'affine:page',
                props: {
                    title: {
                        '$blocksuite:internal:text$': true,
                        delta: this.deltaConverter.astToDelta(titleAst ?? {
                            type: 'text',
                            value: 'Untitled',
                        }),
                    },
                },
                children: [
                    {
                        type: 'block',
                        id: nanoid(),
                        flavour: 'affine:surface',
                        props: {
                            elements: {},
                        },
                        children: [],
                    },
                    await this._traverseHtml(htmlAst, blockSnapshotRoot, payload.assets),
                ],
            },
        };
    }
    async toSliceSnapshot(payload) {
        const htmlAst = this._htmlToAst(payload.file);
        const blockSnapshotRoot = {
            type: 'block',
            id: nanoid(),
            flavour: 'affine:note',
            props: {
                xywh: '[0,0,800,95]',
                background: DefaultTheme.noteBackgrounColor,
                index: 'a0',
                hidden: false,
                displayMode: NoteDisplayMode.DocAndEdgeless,
            },
            children: [],
        };
        const contentSlice = (await this._traverseHtml(htmlAst, blockSnapshotRoot, payload.assets));
        if (contentSlice.children.length === 0) {
            return null;
        }
        return {
            type: 'slice',
            content: [contentSlice],
            workspaceId: payload.workspaceId,
            pageId: payload.pageId,
        };
    }
}
export const HtmlAdapterFactoryIdentifier = AdapterFactoryIdentifier('Html');
export const HtmlAdapterFactoryExtension = {
    setup: di => {
        di.addImpl(HtmlAdapterFactoryIdentifier, provider => ({
            get: job => new HtmlAdapter(job, provider),
        }));
    },
};
