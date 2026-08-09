import type { AffineTextAttributes } from '@blocksuite/affine-shared/types';
import type { BlockComponent, BlockStdScope } from '@blocksuite/std';
import { ShadowlessElement } from '@blocksuite/std';
import type { DeltaInsert } from '@blocksuite/store';
declare const AffineLink_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class AffineLink extends AffineLink_base {
    static styles: import("lit").CSSResult;
    private _identified;
    private readonly _onMouseUp;
    private _referenceInfo;
    openLink: (e?: MouseEvent) => void;
    _whenHover: {
        setReference: (element?: Element) => void;
        setFloating: (element?: Element) => void;
        dispose: () => void;
    };
    connectedCallback(): void;
    get block(): BlockComponent<import("@blocksuite/store").BlockModel<object>, import("@blocksuite/std").BlockService, string> | null;
    get inlineEditor(): import("@blocksuite/std/inline").InlineEditor<AffineTextAttributes> | undefined;
    get link(): string;
    get selfInlineRange(): import("@blocksuite/std/inline").InlineRange | null | undefined;
    private _identify;
    private _renderLink;
    render(): import("lit-html").TemplateResult<1>;
    accessor delta: DeltaInsert<AffineTextAttributes>;
    accessor std: BlockStdScope;
}
export {};
//# sourceMappingURL=affine-link.d.ts.map