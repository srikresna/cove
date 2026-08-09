import type { AffineTextAttributes } from '@blocksuite/affine-shared/types';
import type { BlockStdScope } from '@blocksuite/std';
import { ShadowlessElement } from '@blocksuite/std';
import type { DeltaInsert } from '@blocksuite/store';
declare const AffineMention_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class AffineMention extends AffineMention_base {
    static styles: import("lit").CSSResult;
    render(): import("lit-html").TemplateResult<1>;
    accessor delta: DeltaInsert<AffineTextAttributes>;
    accessor selected: boolean;
    accessor std: BlockStdScope;
}
export {};
//# sourceMappingURL=affine-mention.d.ts.map