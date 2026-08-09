import { DefaultTheme, NoteDisplayMode } from '@blocksuite/affine-model';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { ASTWalker, BaseAdapter, nanoid, } from '@blocksuite/store';
import rehypeParse from 'rehype-parse';
import { unified } from 'unified';
import { AdapterFactoryIdentifier, } from '../types/adapter';
import { HastUtils } from '../utils/hast';
import { BlockNotionHtmlAdapterMatcherIdentifier, } from './block-adapter';
import { NotionHtmlASTToDeltaMatcherIdentifier, NotionHtmlDeltaConverter, } from './delta-converter';
export class NotionHtmlAdapter extends BaseAdapter {
    constructor(job, provider) {
        super(job, provider);
        this._traverseNotionHtml = async (html, snapshot, assets, pageMap) => {
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
                            pageMap,
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
                            pageMap,
                        };
                        await matcher.toBlockSnapshot.leave?.(o, adapterContext);
                    }
                }
            });
            return walker.walk(html, snapshot);
        };
        const blockMatchers = Array.from(provider.getAll(BlockNotionHtmlAdapterMatcherIdentifier).values());
        const notionHtmlInlineToDeltaMatchers = Array.from(provider.getAll(NotionHtmlASTToDeltaMatcherIdentifier).values());
        this.blockMatchers = blockMatchers;
        this.deltaConverter = new NotionHtmlDeltaConverter(job.adapterConfigs, [], notionHtmlInlineToDeltaMatchers);
    }
    _htmlToAst(notionHtml) {
        return unified().use(rehypeParse).parse(notionHtml);
    }
    fromBlockSnapshot(_payload) {
        throw new BlockSuiteError(ErrorCode.TransformerNotImplementedError, 'NotionHtmlAdapter.fromBlockSnapshot is not implemented');
    }
    fromDocSnapshot(_payload) {
        throw new BlockSuiteError(ErrorCode.TransformerNotImplementedError, 'NotionHtmlAdapter.fromDocSnapshot is not implemented');
    }
    fromSliceSnapshot(_payload) {
        throw new BlockSuiteError(ErrorCode.TransformerNotImplementedError, 'NotionHtmlAdapter.fromSliceSnapshot is not implemented');
    }
    toBlockSnapshot(payload) {
        const notionHtmlAst = this._htmlToAst(payload.file);
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
        return this._traverseNotionHtml(notionHtmlAst, blockSnapshotRoot, payload.assets, payload.pageMap);
    }
    async toDoc(payload) {
        const snapshot = await this.toDocSnapshot(payload);
        return this.job.snapshotToDoc(snapshot);
    }
    async toDocSnapshot(payload) {
        const notionHtmlAst = this._htmlToAst(payload.file);
        const titleAst = HastUtils.querySelector(notionHtmlAst, 'title');
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
                id: payload.pageId ?? nanoid(),
                title: HastUtils.getTextContent(titleAst, ''),
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
                            value: '',
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
                    await this._traverseNotionHtml(notionHtmlAst, blockSnapshotRoot, payload.assets, payload.pageMap),
                ],
            },
        };
    }
    async toSliceSnapshot(payload) {
        const notionHtmlAst = this._htmlToAst(payload.file);
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
        const contentSlice = (await this._traverseNotionHtml(notionHtmlAst, blockSnapshotRoot, payload.assets));
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
export const NotionHtmlAdapterFactoryIdentifier = AdapterFactoryIdentifier('NotionHtml');
export const NotionHtmlAdapterFactoryExtension = {
    setup: di => {
        di.addImpl(NotionHtmlAdapterFactoryIdentifier, provider => ({
            get: (job) => new NotionHtmlAdapter(job, provider),
        }));
    },
};
