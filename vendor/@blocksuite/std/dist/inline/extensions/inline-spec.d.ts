import { type ServiceIdentifier, type ServiceProvider } from '@blocksuite/global/di';
import type { BaseTextAttributes, ExtensionType } from '@blocksuite/store';
import type { InlineSpecs } from './type.js';
export declare const InlineSpecIdentifier: ServiceIdentifier<unknown> & (<U extends unknown = unknown>(variant: import("@blocksuite/global/di").ServiceVariant) => ServiceIdentifier<U>);
export declare function InlineSpecExtension<TextAttributes extends BaseTextAttributes>(name: string, getSpec: (provider: ServiceProvider) => InlineSpecs<TextAttributes>): ExtensionType & {
    identifier: ServiceIdentifier<InlineSpecs<TextAttributes>>;
};
export declare function InlineSpecExtension<TextAttributes extends BaseTextAttributes>(spec: InlineSpecs<TextAttributes>): ExtensionType & {
    identifier: ServiceIdentifier<InlineSpecs<TextAttributes>>;
};
//# sourceMappingURL=inline-spec.d.ts.map