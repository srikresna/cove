import { type ServiceIdentifier } from '@blocksuite/global/di';
import type { BaseTextAttributes, ExtensionType } from '@blocksuite/store';
import type { InlineMarkdownMatch } from './type.js';
export declare const MarkdownMatcherIdentifier: ServiceIdentifier<unknown> & (<U extends unknown = unknown>(variant: import("@blocksuite/global/di").ServiceVariant) => ServiceIdentifier<U>);
export declare function InlineMarkdownExtension<TextAttributes extends BaseTextAttributes>(matcher: InlineMarkdownMatch<TextAttributes>): ExtensionType & {
    identifier: ServiceIdentifier<InlineMarkdownMatch<TextAttributes>>;
};
//# sourceMappingURL=markdown-matcher.d.ts.map