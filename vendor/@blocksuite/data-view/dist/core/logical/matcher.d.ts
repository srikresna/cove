import type { TypeInstance } from './type.js';
type MatcherData<Data, Type extends TypeInstance = TypeInstance> = {
    type: Type;
    data: Data;
};
export declare class MatcherCreator<Data, Type extends TypeInstance = TypeInstance> {
    createMatcher(type: Type, data: Data): {
        type: Type;
        data: Data;
    };
}
export declare class Matcher<Data, Type extends TypeInstance = TypeInstance> {
    private readonly list;
    private readonly _match;
    constructor(list: MatcherData<Data, Type>[], _match?: (type: Type, target: TypeInstance) => boolean);
    all(): MatcherData<Data, Type>[];
    allMatched(type: TypeInstance): MatcherData<Data>[];
    allMatchedData(type: TypeInstance): Data[];
    find(f: (data: MatcherData<Data, Type>) => boolean): MatcherData<Data, Type> | undefined;
    findData(f: (data: Data) => boolean): Data | undefined;
    isMatched(type: Type, target: TypeInstance): boolean;
    match(type: TypeInstance): Data | undefined;
}
export declare class Matcher_<Value, Type extends TypeInstance> {
    private readonly list;
    private readonly getType;
    private readonly matchFunc;
    constructor(list: Value[], getType: (value: Value) => Type, matchFunc?: (type: Type, target: TypeInstance) => boolean);
    all(): Value[];
    allMatched(type: TypeInstance): Value[];
    find(f: (data: Value) => boolean): Value | undefined;
    isMatched(type: Type, target: TypeInstance): boolean;
    match(type: TypeInstance): Value | undefined;
}
export {};
//# sourceMappingURL=matcher.d.ts.map