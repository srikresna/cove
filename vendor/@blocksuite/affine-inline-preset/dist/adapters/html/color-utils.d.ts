type Rgb = {
    r: number;
    g: number;
    b: number;
};
export declare const parseCssColor: (value: string) => Rgb | null;
export declare const resolveNearestSupportedColor: (color: string) => string | null;
export declare const extractColorFromStyle: (style: string | undefined) => string | null;
export {};
//# sourceMappingURL=color-utils.d.ts.map