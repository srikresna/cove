import { ListBlockSchema } from '@blocksuite/affine-model';
import { createBlockMeta } from './base.js';
export const todoMeta = createBlockMeta({
    selector: block => {
        if (block.flavour !== ListBlockSchema.model.flavour) {
            return false;
        }
        return block.model.props.type === 'todo';
    },
});
