import { DefaultTheme, NoteDisplayMode } from '@blocksuite/affine-model';
import { ASTWalker, BaseAdapter, BlockSnapshotSchema, nanoid, } from '@blocksuite/store';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { HtmlASTToDeltaMatcherIdentifier, HtmlDeltaConverter, InlineDeltaToHtmlAdapterMatcherIdentifier, } from '../html/delta-converter.js';
import { AdapterFactoryIdentifier } from '../types';
import { BlockMarkdownAdapterMatcherIdentifier, } from './block-adapter';
import { InlineDeltaToMarkdownAdapterMatcherIdentifier, MarkdownASTToDeltaMatcherIdentifier, MarkdownDeltaConverter, } from './delta-converter';
import { remarkGfm } from './gfm';
import { MarkdownPreprocessorManager } from './preprocessor';
import { remarkCallout } from './remark-plugins/remark-callout';
export class MarkdownAdapter extends BaseAdapter {
    constructor(job, provider) {
        super(job, provider);
        this._traverseMarkdown = (markdown, snapshot, assets) => {
            const walker = new ASTWalker();
            walker.setONodeTypeGuard((node) => !Array.isArray(node) &&
                'type' in node &&
                node.type !== undefined);
            walker.setEnter(async (o, context) => {
                for (const matcher of this.blockMatchers) {
                    if (matcher.toMatch(o)) {
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
                            provider: this.provider,
                            textBuffer: { content: '' },
                            assets,
                        };
                        await matcher.toBlockSnapshot.leave?.(o, adapterContext);
                    }
                }
            });
            return walker.walk(markdown, snapshot);
        };
        this._traverseSnapshot = async (snapshot, markdown, assets) => {
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
                ast: (await walker.walk(snapshot, markdown)),
                assetsIds,
            };
        };
        const blockMatchers = Array.from(provider.getAll(BlockMarkdownAdapterMatcherIdentifier).values());
        const inlineDeltaToMarkdownAdapterMatchers = Array.from(provider.getAll(InlineDeltaToMarkdownAdapterMatcherIdentifier).values());
        const markdownInlineToDeltaMatchers = Array.from(provider.getAll(MarkdownASTToDeltaMatcherIdentifier).values());
        const inlineDeltaToHtmlAdapterMatchers = Array.from(provider.getAll(InlineDeltaToHtmlAdapterMatcherIdentifier).values());
        const htmlInlineToDeltaMatchers = Array.from(provider.getAll(HtmlASTToDeltaMatcherIdentifier).values());
        const htmlDeltaConverter = new HtmlDeltaConverter(job.adapterConfigs, inlineDeltaToHtmlAdapterMatchers, htmlInlineToDeltaMatchers, provider);
        this.blockMatchers = blockMatchers;
        this.deltaConverter = new MarkdownDeltaConverter(job.adapterConfigs, inlineDeltaToMarkdownAdapterMatchers, markdownInlineToDeltaMatchers, htmlDeltaConverter);
        this.preprocessorManager = new MarkdownPreprocessorManager(provider);
    }
    _astToMarkdown(ast) {
        return unified()
            .use(remarkGfm)
            .use(remarkStringify, {
            resourceLink: true,
        })
            .use(remarkMath)
            .stringify(ast)
            .replace(/&#x20;\n/g, ' \n');
    }
    _markdownToAst(markdown) {
        const processor = unified()
            .use(remarkParse)
            .use(remarkGfm)
            .use(remarkMath)
            .use(remarkCallout);
        const ast = processor.parse(markdown);
        return processor.runSync(ast);
    }
    async fromBlockSnapshot({ snapshot, assets, }) {
        const root = {
            type: 'root',
            children: [],
        };
        const { ast, assetsIds } = await this._traverseSnapshot(snapshot, root, assets);
        return {
            file: this._astToMarkdown(ast),
            assetsIds,
        };
    }
    async fromDocSnapshot({ snapshot, assets, }) {
        let buffer = '';
        const { file, assetsIds } = await this.fromBlockSnapshot({
            snapshot: snapshot.blocks,
            assets,
        });
        buffer += file;
        return {
            file: buffer,
            assetsIds,
        };
    }
    async fromSliceSnapshot({ snapshot, assets, }) {
        let buffer = '';
        const sliceAssetsIds = [];
        for (const contentSlice of snapshot.content) {
            const root = {
                type: 'root',
                children: [],
            };
            const { ast, assetsIds } = await this._traverseSnapshot(contentSlice, root, assets);
            sliceAssetsIds.push(...assetsIds);
            buffer += this._astToMarkdown(ast);
        }
        const markdown = buffer.match(/\n/g)?.length === 1 ? buffer.trimEnd() : buffer;
        return {
            file: markdown,
            assetsIds: sliceAssetsIds,
        };
    }
    async toBlockSnapshot(payload) {
        const markdownFile = this.preprocessorManager.process('block', payload.file);
        const markdownAst = this._markdownToAst(markdownFile);
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
        return this._traverseMarkdown(markdownAst, blockSnapshotRoot, payload.assets);
    }
    async toDocSnapshot(payload) {
        const markdownFile = this.preprocessorManager.process('doc', payload.file);
        const markdownAst = this._markdownToAst(markdownFile);
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
                title: 'Untitled',
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
                        delta: [
                            {
                                insert: 'Untitled',
                            },
                        ],
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
                    await this._traverseMarkdown(markdownAst, blockSnapshotRoot, payload.assets),
                ],
            },
        };
    }
    async toSliceSnapshot(payload) {
        const markdownFile = this.preprocessorManager.process('slice', payload.file);
        const markdownAst = this._markdownToAst(markdownFile);
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
        const contentSlice = (await this._traverseMarkdown(markdownAst, blockSnapshotRoot, payload.assets));
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
export const MarkdownAdapterFactoryIdentifier = AdapterFactoryIdentifier('Markdown');
export const MarkdownAdapterFactoryExtension = {
    setup: di => {
        di.addImpl(MarkdownAdapterFactoryIdentifier, provider => ({
            get: (job) => new MarkdownAdapter(job, provider),
        }));
    },
};
