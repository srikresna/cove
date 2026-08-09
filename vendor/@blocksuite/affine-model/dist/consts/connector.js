import { createEnumMap } from '../utils/enum.js';
export var ConnectorEndpoint;
(function (ConnectorEndpoint) {
    ConnectorEndpoint["Front"] = "Front";
    ConnectorEndpoint["Rear"] = "Rear";
})(ConnectorEndpoint || (ConnectorEndpoint = {}));
export var PointStyle;
(function (PointStyle) {
    PointStyle["Arrow"] = "Arrow";
    PointStyle["Circle"] = "Circle";
    PointStyle["Diamond"] = "Diamond";
    PointStyle["None"] = "None";
    PointStyle["Triangle"] = "Triangle";
})(PointStyle || (PointStyle = {}));
export const PointStyleMap = createEnumMap(PointStyle);
export const DEFAULT_FRONT_ENDPOINT_STYLE = PointStyle.None;
export const DEFAULT_REAR_ENDPOINT_STYLE = PointStyle.Arrow;
export const CONNECTOR_LABEL_MAX_WIDTH = 280;
export var ConnectorLabelOffsetAnchor;
(function (ConnectorLabelOffsetAnchor) {
    ConnectorLabelOffsetAnchor["Bottom"] = "bottom";
    ConnectorLabelOffsetAnchor["Center"] = "center";
    ConnectorLabelOffsetAnchor["Top"] = "top";
})(ConnectorLabelOffsetAnchor || (ConnectorLabelOffsetAnchor = {}));
export var ConnectorMode;
(function (ConnectorMode) {
    ConnectorMode[ConnectorMode["Straight"] = 0] = "Straight";
    ConnectorMode[ConnectorMode["Orthogonal"] = 1] = "Orthogonal";
    ConnectorMode[ConnectorMode["Curve"] = 2] = "Curve";
})(ConnectorMode || (ConnectorMode = {}));
export const DEFAULT_CONNECTOR_MODE = ConnectorMode.Curve;
