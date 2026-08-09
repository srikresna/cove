export declare const DEFAULT_ROUGHNESS = 1.4;
export declare const DEFAULT_CENTRAL_AREA_RATIO = 0.3;
export declare enum ShapeTextFontSize {
    LARGE = 28,
    MEDIUM = 20,
    SMALL = 12,
    XLARGE = 36
}
export declare enum ShapeType {
    Rect = "rect",
    Ellipse = "ellipse",
    Diamond = "diamond",
    Triangle = "triangle"
}
export type ShapeName = ShapeType | 'roundedRect';
export declare function getShapeName(type: ShapeType, radius: number): ShapeName;
export declare function getShapeType(name: ShapeName): ShapeType;
export declare function getShapeRadius(name: ShapeName): number;
export declare enum ShapeStyle {
    General = "General",
    Scribbled = "Scribbled"
}
//# sourceMappingURL=shape.d.ts.map