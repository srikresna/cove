import type { DataSource } from '../data-source/base';
import type { PropertyConfig } from './types';
export declare const fromJson: <Data, RawValue, JsonValue>(config: PropertyConfig<Data, RawValue, JsonValue>, { value, data, dataSource, }: {
    value: unknown;
    data: Data;
    dataSource: DataSource;
}) => RawValue | undefined;
//# sourceMappingURL=utils.d.ts.map