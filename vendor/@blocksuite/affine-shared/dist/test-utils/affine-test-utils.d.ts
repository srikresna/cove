import type { Store } from '@blocksuite/store';
declare module 'vitest' {
    interface Assertion<T = any> {
        toEqualDoc(expected: Store, options?: {
            compareId?: boolean;
        }): T;
    }
}
//# sourceMappingURL=affine-test-utils.d.ts.map