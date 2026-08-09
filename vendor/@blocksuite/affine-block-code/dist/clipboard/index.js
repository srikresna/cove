import { deleteTextCommand } from '@blocksuite/affine-inline-preset';
import { HtmlAdapter, pasteMiddleware, PlainTextAdapter, } from '@blocksuite/affine-shared/adapters';
import { getBlockIndexCommand, getBlockSelectionsCommand, getTextSelectionCommand, } from '@blocksuite/affine-shared/commands';
import { createIdentifier } from '@blocksuite/global/di';
import { DisposableGroup } from '@blocksuite/global/disposable';
import { Clipboard, LifeCycleWatcher, LifeCycleWatcherIdentifier, StdIdentifier, TextSelection, } from '@blocksuite/std';
export const CodeClipboardAdapterConfigIdentifier = createIdentifier('code-clipboard-adapter-config');
export function CodeClipboardAdapterConfigExtension(config) {
    return {
        setup: di => {
            di.addImpl(CodeClipboardAdapterConfigIdentifier(config.mimeType), () => config);
        },
    };
}
const PlainTextClipboardConfig = CodeClipboardAdapterConfigExtension({
    mimeType: 'text/plain',
    adapter: PlainTextAdapter,
    priority: 90,
});
const HtmlClipboardConfig = CodeClipboardAdapterConfigExtension({
    mimeType: 'text/html',
    adapter: HtmlAdapter,
    priority: 80,
});
export class CodeBlockClipboard extends Clipboard {
    static { this.key = 'code-block-clipboard'; }
    get _adapters() {
        const adapterConfigs = this.std.provider.getAll(CodeClipboardAdapterConfigIdentifier);
        return Array.from(adapterConfigs.values());
    }
}
export class CodeBlockClipboardController extends LifeCycleWatcher {
    static { this.key = 'code-block-clipboard-controller'; }
    constructor(std, clipboard) {
        super(std);
        this.clipboard = clipboard;
        this._disposables = new DisposableGroup();
        this._init = () => {
            const paste = pasteMiddleware(this.std);
            this.clipboard.use(paste);
            this._disposables.add({
                dispose: () => {
                    this.clipboard.unuse(paste);
                },
            });
        };
        this.onPaste = ctx => {
            const e = ctx.get('clipboardState').raw;
            e.preventDefault();
            const textSelection = this.std.selection.find(TextSelection);
            const plainText = e.clipboardData
                ?.getData('text/plain')
                ?.replace(/\r?\n|\r/g, '\n');
            const selectedBlockId = textSelection?.from.blockId;
            const codeBlock = selectedBlockId
                ? this.std.store.getBlock(selectedBlockId)?.model
                : null;
            if (plainText && codeBlock?.flavour === 'affine:code' && selectedBlockId) {
                const richText = this.std.view
                    .getBlock(selectedBlockId)
                    ?.querySelector('rich-text');
                const inlineEditor = richText?.inlineEditor;
                const inlineRange = inlineEditor?.getInlineRange();
                if (inlineEditor && inlineRange) {
                    inlineEditor.insertText(inlineRange, plainText);
                    inlineEditor.setInlineRange({
                        index: inlineRange.index + plainText.length,
                        length: 0,
                    });
                    return true;
                }
            }
            this.std.store.captureSync();
            this.std.command
                .chain()
                .try(cmd => [
                cmd.pipe(getTextSelectionCommand).pipe((ctx, next) => {
                    const textSelection = ctx.currentTextSelection;
                    if (!textSelection)
                        return;
                    const end = textSelection.to ?? textSelection.from;
                    next({ currentSelectionPath: end.blockId });
                }),
                cmd.pipe(getBlockSelectionsCommand).pipe((ctx, next) => {
                    const currentBlockSelections = ctx.currentBlockSelections;
                    if (!currentBlockSelections)
                        return;
                    const blockSelection = currentBlockSelections.at(-1);
                    if (!blockSelection)
                        return;
                    next({ currentSelectionPath: blockSelection.blockId });
                }),
            ])
                .pipe(getBlockIndexCommand)
                .try(cmd => [cmd.pipe(getTextSelectionCommand).pipe(deleteTextCommand)])
                .pipe((ctx, next) => {
                if (!ctx.parentBlock) {
                    return;
                }
                this.clipboard
                    .paste(e, this.std.store, ctx.parentBlock.model.id, ctx.blockIndex ? ctx.blockIndex + 1 : 1)
                    .catch(console.error);
                return next();
            })
                .run();
            return true;
        };
    }
    static setup(di) {
        di.add(this, [StdIdentifier, CodeBlockClipboard]);
        di.addImpl(LifeCycleWatcherIdentifier(this.key), provider => provider.get(this));
    }
    mounted() {
        this._init();
        // add paste event listener for code block
        const subscription = this.std.view.viewUpdated.subscribe(({ type, method, view }) => {
            if (type !== 'block' || view.model.flavour !== 'affine:code')
                return;
            if (method === 'add') {
                view.handleEvent('paste', this.onPaste);
            }
        });
        this._disposables.add(subscription);
    }
    unmounted() {
        this._disposables.dispose();
    }
}
export function getCodeClipboardExtensions() {
    return [
        PlainTextClipboardConfig,
        HtmlClipboardConfig,
        CodeBlockClipboard,
        CodeBlockClipboardController,
    ];
}
