import { type ViewExtensionContext, ViewExtensionProvider } from '@blocksuite/affine-ext-loader';
export declare class RootViewExtension extends ViewExtensionProvider {
    name: string;
    effect(): void;
    setup(context: ViewExtensionContext): void;
    private readonly _setupPage;
    private readonly _setupEdgeless;
}
//# sourceMappingURL=view.d.ts.map