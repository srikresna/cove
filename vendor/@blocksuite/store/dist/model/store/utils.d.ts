import type { z } from 'zod';
import type { BlockModel } from '../block/block-model.js';
import type { BlockProps, YBlock } from '../block/types.js';
import type { BlockSchema } from '../block/zod.js';
export declare function syncBlockProps(schema: z.infer<typeof BlockSchema>, model: BlockModel, yBlock: YBlock, props: Partial<BlockProps>): void;
//# sourceMappingURL=utils.d.ts.map