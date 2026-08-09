import { z } from 'zod';
export function dynamicSchema(keyValidator, valueType) {
    return z.preprocess(record => {
        // check it is a record
        if (typeof record !== 'object' || record === null) {
            return {};
        }
        return Object.entries(record)
            .filter((data) => keyValidator(data[0]))
            .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
    }, z.record(z.custom(keyValidator), valueType));
}
