import type { ExtensionType } from '../extension';
import type { SelectionConstructor } from './types';
export declare const SelectionIdentifier: import("@blocksuite/global/di").ServiceIdentifier<SelectionConstructor<import("./base").BaseSelection>> & (<U extends SelectionConstructor<import("./base").BaseSelection> = SelectionConstructor<import("./base").BaseSelection>>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function SelectionExtension(selectionCtor: SelectionConstructor): ExtensionType;
//# sourceMappingURL=identifier.d.ts.map