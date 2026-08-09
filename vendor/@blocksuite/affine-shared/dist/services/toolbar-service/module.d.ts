import type { BlockFlavourIdentifier } from '@blocksuite/std';
import type { ToolbarModuleConfig } from './config';
export type ToolbarModule = {
    readonly id: ReturnType<typeof BlockFlavourIdentifier>;
    readonly config: ToolbarModuleConfig;
};
//# sourceMappingURL=module.d.ts.map