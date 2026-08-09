import { InlineSpecExtension, } from '@blocksuite/std/inline';
import { html } from 'lit';
import { z } from 'zod';
export const BoldInlineSpecExtension = InlineSpecExtension({
    name: 'bold',
    schema: z.object({
        bold: z.literal(true).optional().nullable().catch(undefined),
    }),
    match: delta => {
        return !!delta.attributes?.bold;
    },
    renderer: ({ delta }) => {
        return html `<affine-text .delta=${delta}></affine-text>`;
    },
});
export const ItalicInlineSpecExtension = InlineSpecExtension({
    name: 'italic',
    schema: z.object({
        italic: z.literal(true).optional().nullable().catch(undefined),
    }),
    match: delta => {
        return !!delta.attributes?.italic;
    },
    renderer: ({ delta }) => {
        return html `<affine-text .delta=${delta}></affine-text>`;
    },
});
export const UnderlineInlineSpecExtension = InlineSpecExtension({
    name: 'underline',
    schema: z.object({
        underline: z.literal(true).optional().nullable().catch(undefined),
    }),
    match: delta => {
        return !!delta.attributes?.underline;
    },
    renderer: ({ delta }) => {
        return html `<affine-text .delta=${delta}></affine-text>`;
    },
});
export const StrikeInlineSpecExtension = InlineSpecExtension({
    name: 'strike',
    schema: z.object({
        strike: z.literal(true).optional().nullable().catch(undefined),
    }),
    match: delta => {
        return !!delta.attributes?.strike;
    },
    renderer: ({ delta }) => {
        return html `<affine-text .delta=${delta}></affine-text>`;
    },
});
export const CodeInlineSpecExtension = InlineSpecExtension({
    name: 'inline-code',
    schema: z.object({
        code: z.literal(true).optional().nullable().catch(undefined),
    }),
    match: delta => {
        return !!delta.attributes?.code;
    },
    renderer: ({ delta }) => {
        return html `<affine-text .delta=${delta}></affine-text>`;
    },
});
export const BackgroundInlineSpecExtension = InlineSpecExtension({
    name: 'background',
    schema: z.object({
        background: z.string().optional().nullable().catch(undefined),
    }),
    match: delta => {
        return !!delta.attributes?.background;
    },
    renderer: ({ delta }) => {
        return html `<affine-text .delta=${delta}></affine-text>`;
    },
});
export const ColorInlineSpecExtension = InlineSpecExtension({
    name: 'color',
    schema: z.object({
        color: z.string().optional().nullable().catch(undefined),
    }),
    match: delta => {
        return !!delta.attributes?.color;
    },
    renderer: ({ delta }) => {
        return html `<affine-text .delta=${delta}></affine-text>`;
    },
});
export const InlineSpecExtensions = [
    BoldInlineSpecExtension,
    ItalicInlineSpecExtension,
    UnderlineInlineSpecExtension,
    StrikeInlineSpecExtension,
    CodeInlineSpecExtension,
    BackgroundInlineSpecExtension,
    ColorInlineSpecExtension,
];
