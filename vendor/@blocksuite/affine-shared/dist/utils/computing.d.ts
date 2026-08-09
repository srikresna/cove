export declare function getMostCommonValue<T, F extends keyof T>(records: T[], field: F): NonNullable<T>[F] | undefined;
export declare function getMostCommonResolvedValue<T, F extends keyof T, U>(records: T[], field: F, resolve: (value: T[F]) => U): U | undefined;
//# sourceMappingURL=computing.d.ts.map