import { SurfaceSelection } from '@blocksuite/std';
export const getSurfaceSelectionCommand = (ctx, next) => {
    const currentSurfaceSelection = ctx.std.selection.find(SurfaceSelection);
    if (!currentSurfaceSelection)
        return;
    next({ currentSurfaceSelection });
};
