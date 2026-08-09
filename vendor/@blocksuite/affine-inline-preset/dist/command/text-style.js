import { getBlockSelectionsCommand, getTextSelectionCommand, } from '@blocksuite/affine-shared/commands';
import { formatBlockCommand } from './format-block.js';
import { formatNativeCommand } from './format-native.js';
import { formatTextCommand } from './format-text.js';
import { getCombinedTextAttributes } from './utils.js';
export const toggleTextStyleCommand = (ctx, next) => {
    const { std, key } = ctx;
    const [active] = std.command
        .chain()
        .pipe(isTextAttributeActive, { key })
        .run();
    const payload = {
        styles: {
            [key]: active ? null : true,
        },
    };
    const [result] = std.command
        .chain()
        .try(chain => [
        chain.pipe(getTextSelectionCommand).pipe(formatTextCommand, payload),
        chain.pipe(getBlockSelectionsCommand).pipe(formatBlockCommand, payload),
        chain.pipe(formatNativeCommand, payload),
    ])
        .run();
    if (result) {
        return next();
    }
    return false;
};
const toggleTextStyleCommandWrapper = (key) => {
    return (ctx, next) => {
        const [success] = ctx.std.command
            .chain()
            .pipe(toggleTextStyleCommand, { key })
            .run();
        if (success)
            next();
        return false;
    };
};
export const toggleBold = toggleTextStyleCommandWrapper('bold');
export const toggleItalic = toggleTextStyleCommandWrapper('italic');
export const toggleUnderline = toggleTextStyleCommandWrapper('underline');
export const toggleStrike = toggleTextStyleCommandWrapper('strike');
export const toggleCode = toggleTextStyleCommandWrapper('code');
export const getTextAttributes = (ctx, next) => {
    const [result, innerCtx] = getCombinedTextAttributes(ctx.std.command.chain()).run();
    if (!result) {
        return false;
    }
    return next({ textAttributes: innerCtx.textAttributes });
};
export const isTextAttributeActive = (ctx, next) => {
    const key = ctx.key;
    const [result] = getCombinedTextAttributes(ctx.std.command.chain())
        .pipe((ctx, next) => {
        const { textAttributes } = ctx;
        if (textAttributes && key in textAttributes) {
            return next();
        }
        return false;
    })
        .run();
    if (!result) {
        return false;
    }
    return next();
};
