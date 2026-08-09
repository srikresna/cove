export const DEFAULT_ROUGHNESS = 1.4;
// TODO: need to check the default central area ratio
export const DEFAULT_CENTRAL_AREA_RATIO = 0.3;
export var ShapeTextFontSize;
(function (ShapeTextFontSize) {
    ShapeTextFontSize[ShapeTextFontSize["LARGE"] = 28] = "LARGE";
    ShapeTextFontSize[ShapeTextFontSize["MEDIUM"] = 20] = "MEDIUM";
    ShapeTextFontSize[ShapeTextFontSize["SMALL"] = 12] = "SMALL";
    ShapeTextFontSize[ShapeTextFontSize["XLARGE"] = 36] = "XLARGE";
})(ShapeTextFontSize || (ShapeTextFontSize = {}));
export var ShapeType;
(function (ShapeType) {
    ShapeType["Rect"] = "rect";
    ShapeType["Ellipse"] = "ellipse";
    ShapeType["Diamond"] = "diamond";
    ShapeType["Triangle"] = "triangle";
})(ShapeType || (ShapeType = {}));
export function getShapeName(type, radius) {
    if (type === ShapeType.Rect && radius > 0) {
        return 'roundedRect';
    }
    return type;
}
export function getShapeType(name) {
    if (name === 'roundedRect') {
        return ShapeType.Rect;
    }
    return name;
}
export function getShapeRadius(name) {
    if (name === 'roundedRect') {
        return 0.1;
    }
    return 0;
}
export var ShapeStyle;
(function (ShapeStyle) {
    ShapeStyle["General"] = "General";
    ShapeStyle["Scribbled"] = "Scribbled";
})(ShapeStyle || (ShapeStyle = {}));
