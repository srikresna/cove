import type { ReadonlySignal } from '@preact/signals-core';
export interface VirtualKeyboardProvider {
    readonly visible$: ReadonlySignal<boolean>;
    readonly height$: ReadonlySignal<number>;
    /**
     * The static height of the keyboard, it should record the last non-zero height of virtual keyboard
     */
    readonly staticHeight$: ReadonlySignal<number>;
    /**
     * The safe area of the app tab, it will be used when the keyboard is open or closed
     */
    readonly appTabSafeArea$: ReadonlySignal<string>;
}
export interface VirtualKeyboardProviderWithAction extends VirtualKeyboardProvider {
    show: () => void;
    hide: () => void;
}
export declare const VirtualKeyboardProvider: import("@blocksuite/global/di").ServiceIdentifier<VirtualKeyboardProvider | VirtualKeyboardProviderWithAction> & (<U extends VirtualKeyboardProvider | VirtualKeyboardProviderWithAction = VirtualKeyboardProvider | VirtualKeyboardProviderWithAction>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function isVirtualKeyboardProviderWithAction(provider: VirtualKeyboardProvider): provider is VirtualKeyboardProviderWithAction;
//# sourceMappingURL=virtual-keyboard-service.d.ts.map