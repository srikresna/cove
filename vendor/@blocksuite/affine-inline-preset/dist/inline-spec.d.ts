import type { AffineTextAttributes } from '@blocksuite/affine-shared/types';
import { type InlineRootElement } from '@blocksuite/std/inline';
import type { ExtensionType } from '@blocksuite/store';
export type AffineInlineRootElement = InlineRootElement<AffineTextAttributes>;
export declare const BoldInlineSpecExtension: ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<import("@blocksuite/std/inline").InlineSpecs<AffineTextAttributes>>;
};
export declare const ItalicInlineSpecExtension: ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<import("@blocksuite/std/inline").InlineSpecs<AffineTextAttributes>>;
};
export declare const UnderlineInlineSpecExtension: ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<import("@blocksuite/std/inline").InlineSpecs<AffineTextAttributes>>;
};
export declare const StrikeInlineSpecExtension: ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<import("@blocksuite/std/inline").InlineSpecs<AffineTextAttributes>>;
};
export declare const CodeInlineSpecExtension: ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<import("@blocksuite/std/inline").InlineSpecs<AffineTextAttributes>>;
};
export declare const BackgroundInlineSpecExtension: ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<import("@blocksuite/std/inline").InlineSpecs<AffineTextAttributes>>;
};
export declare const ColorInlineSpecExtension: ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<import("@blocksuite/std/inline").InlineSpecs<AffineTextAttributes>>;
};
export declare const InlineSpecExtensions: ExtensionType[];
//# sourceMappingURL=inline-spec.d.ts.map