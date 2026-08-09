import { SYS_KEYS } from '../../consts.js';
import { internalPrimitives } from '../block/zod.js';
export function syncBlockProps(schema, model, yBlock, props) {
    const defaultProps = schema.model.props?.(internalPrimitives) ?? {};
    Object.entries(props).forEach(([key, value]) => {
        if (SYS_KEYS.has(key))
            return;
        if (value === undefined)
            return;
        // @ts-expect-error allow props
        model.props[key] = value;
    });
    // set default value
    Object.entries(defaultProps).forEach(([key, value]) => {
        const notExists = !yBlock.has(`prop:${key}`) || yBlock.get(`prop:${key}`) === undefined;
        if (!notExists) {
            return;
        }
        // @ts-expect-error allow props
        model[key] = value;
    });
}
