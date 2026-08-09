import type { RootContentMap } from 'hast';
type HastUnionType<K extends keyof RootContentMap, V extends RootContentMap[K]> = V;
export declare function onlyContainImgElement(ast: HastUnionType<keyof RootContentMap, RootContentMap[keyof RootContentMap]>): 'yes' | 'no' | 'maybe';
export {};
//# sourceMappingURL=utils.d.ts.map