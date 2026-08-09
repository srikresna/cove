import type { AffineTextAttributes } from '@blocksuite/affine-shared/types';
import { type Chain, type InitCommandCtx } from '@blocksuite/std';
export declare function getCombinedTextAttributes(chain: Chain<InitCommandCtx>): Chain<InitCommandCtx & {
    textAttributes: AffineTextAttributes;
}>;
export declare function isFormatSupported(chain: Chain<InitCommandCtx>): Chain<InitCommandCtx & {
    textAttributes: AffineTextAttributes;
}>;
//# sourceMappingURL=utils.d.ts.map