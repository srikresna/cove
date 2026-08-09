import { CodeBlockModel, ListBlockModel, NoteBlockModel, NoteBlockSchema, ParagraphBlockModel, } from '@blocksuite/affine-model';
import { textAlignConfigs, textConversionConfigs, } from '@blocksuite/affine-rich-text';
import { focusBlockEnd, focusBlockStart, getBlockSelectionsCommand, getNextBlockCommand, getPrevBlockCommand, getTextSelectionCommand, } from '@blocksuite/affine-shared/commands';
import { asyncGetBlockComponent, matchModels, } from '@blocksuite/affine-shared/utils';
import { BlockSelection, KeymapExtension, TextSelection, } from '@blocksuite/std';
import { dedentBlocks, dedentBlocksToRoot, indentBlocks, selectBlock, selectBlocksBetween, updateBlockAlign, updateBlockType, } from './commands';
import { moveBlockConfigs } from './move-block';
import { quickActionConfig } from './quick-action';
class NoteKeymap {
    constructor(std) {
        this.std = std;
        this._anchorSel = null;
        this._bindMoveBlockHotKey = () => {
            return moveBlockConfigs.reduce((acc, config) => {
                const keys = config.hotkey.reduce((acc, key) => {
                    return {
                        ...acc,
                        [key]: ctx => {
                            ctx.get('defaultState').event.preventDefault();
                            return config.action(this.std);
                        },
                    };
                }, {});
                return {
                    ...acc,
                    ...keys,
                };
            }, {});
        };
        this._bindQuickActionHotKey = () => {
            return quickActionConfig
                .filter(config => config.hotkey)
                .reduce((acc, config) => {
                return {
                    ...acc,
                    [config.hotkey]: ctx => {
                        if (!config.showWhen(this.std))
                            return;
                        ctx.get('defaultState').event.preventDefault();
                        config.action(this.std);
                    },
                };
            }, {});
        };
        this._bindTextConversionHotKey = () => {
            return textConversionConfigs
                .filter(item => item.hotkey)
                .reduce((acc, item) => {
                const keymap = item.hotkey.reduce((acc, key) => {
                    return {
                        ...acc,
                        [key]: ctx => {
                            ctx.get('defaultState').event.preventDefault();
                            const [result] = this._std.command
                                .chain()
                                .pipe(updateBlockType, {
                                flavour: item.flavour,
                                props: {
                                    type: item.type,
                                },
                            })
                                .pipe((ctx, next) => {
                                const newModels = ctx.updatedBlocks;
                                if (!newModels) {
                                    return;
                                }
                                if (item.flavour !== 'affine:code') {
                                    return;
                                }
                                const [codeModel] = newModels;
                                asyncGetBlockComponent(ctx.std, codeModel.id)
                                    .then(codeElement => {
                                    if (!codeElement) {
                                        return;
                                    }
                                    this._std.selection.setGroup('note', [
                                        this._std.selection.create(TextSelection, {
                                            from: {
                                                blockId: codeElement.blockId,
                                                index: 0,
                                                length: codeModel.text?.length ?? 0,
                                            },
                                            to: null,
                                        }),
                                    ]);
                                })
                                    .catch(console.error);
                                next();
                            })
                                .run();
                            return result;
                        },
                    };
                }, {});
                return {
                    ...acc,
                    ...keymap,
                };
            }, {});
        };
        this._bindTextAlignHotKey = () => {
            return textAlignConfigs.reduce((acc, item) => {
                const keymap = item.hotkey.reduce((acc, key) => {
                    return {
                        ...acc,
                        [key]: ctx => {
                            ctx.get('defaultState').event.preventDefault();
                            const [result] = this._std.command
                                .chain()
                                .pipe(updateBlockAlign, { textAlign: item.textAlign })
                                .run();
                            return result;
                        },
                    };
                }, {});
                return {
                    ...acc,
                    ...keymap,
                };
            }, {});
        };
        this._focusBlock = null;
        this._getClosestNoteByBlockId = (blockId) => {
            const doc = this._std.store;
            let parent = doc.getBlock(blockId)?.model ?? null;
            while (parent) {
                if (matchModels(parent, [NoteBlockModel])) {
                    return parent;
                }
                parent = doc.getParent(parent);
            }
            return null;
        };
        this._onArrowDown = (ctx) => {
            const event = ctx.get('defaultState').event;
            const [result] = this._std.command
                .chain()
                .pipe((_, next) => {
                this._reset();
                return next();
            })
                .try(cmd => [
                // text selection - select the next block
                // 1. is paragraph, list, code block - follow the default behavior
                // 2. is not - select the next block (use block selection instead of text selection)
                cmd
                    .pipe(getTextSelectionCommand)
                    .pipe((ctx, next) => {
                    const currentTextSelection = ctx.currentTextSelection;
                    if (!currentTextSelection) {
                        return;
                    }
                    return next({ currentSelectionPath: currentTextSelection.blockId });
                })
                    .pipe(getNextBlockCommand)
                    .pipe((ctx, next) => {
                    const { nextBlock } = ctx;
                    if (!nextBlock) {
                        return;
                    }
                    if (!matchModels(nextBlock.model, [
                        ParagraphBlockModel,
                        ListBlockModel,
                        CodeBlockModel,
                    ])) {
                        this._std.command.exec(selectBlock, {
                            focusBlock: nextBlock,
                        });
                    }
                    return next({});
                }),
                // block selection - select the next block
                // 1. is paragraph, list, code block - focus it
                // 2. is not - select it using block selection
                cmd
                    .pipe(getBlockSelectionsCommand)
                    .pipe((ctx, next) => {
                    const currentBlockSelections = ctx.currentBlockSelections;
                    const blockSelection = currentBlockSelections?.at(-1);
                    if (!blockSelection) {
                        return;
                    }
                    return next({ currentSelectionPath: blockSelection.blockId });
                })
                    .pipe(getNextBlockCommand)
                    .pipe((ctx, next) => {
                    const { nextBlock } = ctx;
                    if (!nextBlock) {
                        return;
                    }
                    event.preventDefault();
                    if (matchModels(nextBlock.model, [
                        ParagraphBlockModel,
                        ListBlockModel,
                        CodeBlockModel,
                    ])) {
                        this._std.command.exec(focusBlockStart, {
                            focusBlock: nextBlock,
                        });
                        return next();
                    }
                    this._std.command.exec(selectBlock, {
                        focusBlock: nextBlock,
                    });
                    return next();
                }),
            ])
                .run();
            return result;
        };
        this._onArrowUp = (ctx) => {
            const event = ctx.get('defaultState').event;
            const [result] = this._std.command
                .chain()
                .pipe((_, next) => {
                this._reset();
                return next();
            })
                .try(cmd => [
                // text selection - select the previous block
                // 1. is paragraph, list, code block - follow the default behavior
                // 2. is not - select the previous block (use block selection instead of text selection)
                cmd
                    .pipe(getTextSelectionCommand)
                    .pipe((ctx, next) => {
                    const currentTextSelection = ctx.currentTextSelection;
                    if (!currentTextSelection) {
                        return;
                    }
                    return next({ currentSelectionPath: currentTextSelection.blockId });
                })
                    .pipe(getPrevBlockCommand)
                    .pipe((ctx, next) => {
                    const { prevBlock } = ctx;
                    if (!prevBlock) {
                        return;
                    }
                    if (!matchModels(prevBlock.model, [
                        ParagraphBlockModel,
                        ListBlockModel,
                        CodeBlockModel,
                    ])) {
                        this._std.command.exec(selectBlock, {
                            focusBlock: prevBlock,
                        });
                    }
                    return next();
                }),
                // block selection - select the previous block
                // 1. is paragraph, list, code block - focus it
                // 2. is not - select it using block selection
                cmd
                    .pipe(getBlockSelectionsCommand)
                    .pipe((ctx, next) => {
                    const currentBlockSelections = ctx.currentBlockSelections;
                    const blockSelection = currentBlockSelections?.at(-1);
                    if (!blockSelection) {
                        return;
                    }
                    return next({ currentSelectionPath: blockSelection.blockId });
                })
                    .pipe(getPrevBlockCommand)
                    .pipe((ctx, next) => {
                    const { prevBlock } = ctx;
                    if (!prevBlock) {
                        return;
                    }
                    if (matchModels(prevBlock.model, [
                        ParagraphBlockModel,
                        ListBlockModel,
                        CodeBlockModel,
                    ])) {
                        event.preventDefault();
                        this._std.command.exec(focusBlockEnd, {
                            focusBlock: prevBlock,
                        });
                        return next();
                    }
                    this._std.command.exec(selectBlock, {
                        focusBlock: prevBlock,
                    });
                    return next();
                }),
            ])
                .run();
            return result;
        };
        this._onBlockShiftDown = (cmd) => {
            return cmd
                .pipe(getBlockSelectionsCommand)
                .pipe((ctx, next) => {
                const blockSelections = ctx.currentBlockSelections;
                if (!blockSelections) {
                    return;
                }
                if (!this._anchorSel) {
                    this._anchorSel = blockSelections.at(-1) ?? null;
                }
                if (!this._anchorSel) {
                    return;
                }
                const anchorBlock = ctx.std.view.getBlock(this._anchorSel.blockId);
                if (!anchorBlock) {
                    return;
                }
                return next({
                    anchorBlock,
                    currentSelectionPath: this._focusBlock?.blockId ?? anchorBlock?.blockId,
                });
            })
                .pipe(getNextBlockCommand)
                .pipe((ctx, next) => {
                const nextBlock = ctx.nextBlock;
                if (!nextBlock) {
                    return;
                }
                this._focusBlock = nextBlock;
                return next({
                    focusBlock: this._focusBlock,
                });
            })
                .pipe(selectBlocksBetween, { tail: true });
        };
        this._onBlockShiftUp = (cmd) => {
            return cmd
                .pipe(getBlockSelectionsCommand)
                .pipe((ctx, next) => {
                const blockSelections = ctx.currentBlockSelections;
                if (!blockSelections) {
                    return;
                }
                if (!this._anchorSel) {
                    this._anchorSel = blockSelections.at(0) ?? null;
                }
                if (!this._anchorSel) {
                    return;
                }
                const anchorBlock = ctx.std.view.getBlock(this._anchorSel.blockId);
                if (!anchorBlock) {
                    return;
                }
                return next({
                    anchorBlock,
                    currentSelectionPath: this._focusBlock?.blockId ?? anchorBlock?.blockId,
                });
            })
                .pipe(getPrevBlockCommand)
                .pipe((ctx, next) => {
                const prevBlock = ctx.prevBlock;
                if (!prevBlock) {
                    return;
                }
                this._focusBlock = prevBlock;
                return next({
                    focusBlock: this._focusBlock,
                });
            })
                .pipe(selectBlocksBetween, { tail: false });
        };
        this._onEnter = (ctx) => {
            const event = ctx.get('defaultState').event;
            const [result] = this._std.command
                .chain()
                .pipe(getBlockSelectionsCommand)
                .pipe((ctx, next) => {
                const blockSelection = ctx.currentBlockSelections?.at(-1);
                if (!blockSelection) {
                    return;
                }
                const { view, store, selection } = ctx.std;
                const element = view.getBlock(blockSelection.blockId);
                if (!element) {
                    return;
                }
                const { model } = element;
                const parent = store.getParent(model);
                if (!parent) {
                    return;
                }
                const index = parent.children.indexOf(model) ?? undefined;
                const blockId = store.addBlock('affine:paragraph', {}, parent, index + 1);
                const sel = selection.create(TextSelection, {
                    from: {
                        blockId,
                        index: 0,
                        length: 0,
                    },
                    to: null,
                });
                event.preventDefault();
                selection.setGroup('note', [sel]);
                this._reset();
                return next();
            })
                .run();
            return result;
        };
        this._onEsc = () => {
            const [result] = this._std.command
                .chain()
                .pipe(getBlockSelectionsCommand)
                .pipe((ctx, next) => {
                const blockSelection = ctx.currentBlockSelections?.at(-1);
                if (!blockSelection) {
                    return;
                }
                ctx.std.selection.update(selList => {
                    return selList.filter(sel => !sel.is(BlockSelection));
                });
                return next();
            })
                .run();
            return result;
        };
        this._onSelectAll = ctx => {
            const selection = this._std.selection;
            const block = selection.find(BlockSelection);
            if (!block) {
                return;
            }
            const note = this._getClosestNoteByBlockId(block.blockId);
            if (!note) {
                return;
            }
            ctx.get('defaultState').event.preventDefault();
            const children = note.children;
            const blocks = children.map(child => {
                return selection.create(BlockSelection, {
                    blockId: child.id,
                });
            });
            selection.update(selList => {
                return selList
                    .filter(sel => !sel.is(BlockSelection))
                    .concat(blocks);
            });
        };
        this._onShiftArrowDown = () => {
            const [result] = this._std.command
                .chain()
                .try(cmd => [
                // block selection
                this._onBlockShiftDown(cmd),
            ])
                .run();
            return result;
        };
        this._onShiftArrowUp = () => {
            const [result] = this._std.command
                .chain()
                .try(cmd => [
                // block selection
                this._onBlockShiftUp(cmd),
            ])
                .run();
            return result;
        };
        this._reset = () => {
            this._anchorSel = null;
            this._focusBlock = null;
        };
    }
    get _std() {
        return this.std;
    }
    get hotKeys() {
        return {
            ...this._bindMoveBlockHotKey(),
            ...this._bindQuickActionHotKey(),
            ...this._bindTextConversionHotKey(),
            ...this._bindTextAlignHotKey(),
            Tab: ctx => {
                const [success] = this.std.command.exec(indentBlocks);
                if (!success)
                    return;
                ctx.get('keyboardState').raw.preventDefault();
                return true;
            },
            'Shift-Tab': ctx => {
                const [success] = this.std.command.exec(dedentBlocks);
                if (!success)
                    return;
                ctx.get('keyboardState').raw.preventDefault();
                return true;
            },
            'Mod-Backspace': ctx => {
                const [success] = this.std.command.exec(dedentBlocksToRoot);
                if (!success)
                    return;
                ctx.get('keyboardState').raw.preventDefault();
                return true;
            },
            ArrowDown: this._onArrowDown,
            ArrowUp: this._onArrowUp,
            'Shift-ArrowDown': this._onShiftArrowDown,
            'Shift-ArrowUp': this._onShiftArrowUp,
            Escape: this._onEsc,
            Enter: this._onEnter,
            'Mod-a': this._onSelectAll,
        };
    }
}
export const NoteKeymapExtension = KeymapExtension(std => new NoteKeymap(std).hotKeys, {
    flavour: NoteBlockSchema.model.flavour,
});
