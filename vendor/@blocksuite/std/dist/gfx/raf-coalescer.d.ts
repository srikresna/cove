export interface RafCoalescer<T> {
    cancel: () => void;
    flush: () => void;
    schedule: (payload: T) => void;
}
/**
 * Coalesce high-frequency updates and only process the latest payload in one frame.
 */
export declare const createRafCoalescer: <T>(apply: (payload: T) => void) => RafCoalescer<T>;
//# sourceMappingURL=raf-coalescer.d.ts.map