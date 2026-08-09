import type { BlockStdScope } from '@blocksuite/std';
export declare class RemoteColorManager {
    readonly std: BlockStdScope;
    private get awarenessStore();
    constructor(std: BlockStdScope);
    get(id: number): string | null;
}
//# sourceMappingURL=remote-color-manager.d.ts.map