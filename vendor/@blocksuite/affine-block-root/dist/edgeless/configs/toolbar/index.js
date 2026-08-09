import { ToolbarModuleExtension } from '@blocksuite/affine-shared/services';
import { BlockFlavourIdentifier } from '@blocksuite/std';
import { builtinLockedToolbarConfig, builtinMiscToolbarConfig } from './misc';
export const EdgelessElementToolbarExtension = [
    ToolbarModuleExtension({
        id: BlockFlavourIdentifier('affine:surface:*'),
        config: builtinMiscToolbarConfig,
    }),
    // Special Scenarios
    // Only display the `unlock` button when the selection includes a locked element.
    ToolbarModuleExtension({
        id: BlockFlavourIdentifier('affine:surface:locked'),
        config: builtinLockedToolbarConfig,
    }),
];
