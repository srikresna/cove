import type { TemplateResult } from 'lit';
import type { PeekableClass } from './type.js';
export declare class PeekableController<T extends PeekableClass> {
    private readonly target;
    private readonly enable?;
    private readonly _getPeekViewService;
    peek: (template?: TemplateResult) => Promise<void>;
    get peekable(): boolean;
    constructor(target: T, enable?: ((e: T) => boolean) | undefined);
}
//# sourceMappingURL=controller.d.ts.map