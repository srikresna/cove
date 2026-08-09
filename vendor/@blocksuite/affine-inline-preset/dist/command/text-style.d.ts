import type { AffineTextAttributes, AffineTextStyleAttributes } from '@blocksuite/affine-shared/types';
import type { Command } from '@blocksuite/std';
export declare const toggleTextStyleCommand: Command<{
    key: Extract<keyof AffineTextStyleAttributes, 'bold' | 'italic' | 'underline' | 'strike' | 'code'>;
}>;
export declare const toggleBold: Command;
export declare const toggleItalic: Command;
export declare const toggleUnderline: Command;
export declare const toggleStrike: Command;
export declare const toggleCode: Command;
export declare const getTextAttributes: Command<{}, {
    textAttributes: AffineTextAttributes;
}>;
export declare const isTextAttributeActive: Command<{
    key: keyof AffineTextAttributes;
}>;
//# sourceMappingURL=text-style.d.ts.map