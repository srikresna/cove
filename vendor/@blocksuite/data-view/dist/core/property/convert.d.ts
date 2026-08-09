import type { PropertyModel } from './property-config.js';
import type { GetPropertyDataFromConfig, GetRawValueFromConfig } from './types.js';
export type ConvertFunction<From extends PropertyModel = PropertyModel, To extends PropertyModel = PropertyModel> = (property: GetPropertyDataFromConfig<From['config']>, cells: (GetRawValueFromConfig<From['config']> | undefined)[]) => {
    property: GetPropertyDataFromConfig<To['config']>;
    cells: (GetRawValueFromConfig<To['config']> | undefined)[];
};
export declare const createPropertyConvert: <From extends PropertyModel<any, any, any, any>, To extends PropertyModel<any, any, any, any>>(from: From, to: To, convert: ConvertFunction<From, To>) => {
    from: any;
    to: any;
    convert: ConvertFunction<From, To>;
};
//# sourceMappingURL=convert.d.ts.map