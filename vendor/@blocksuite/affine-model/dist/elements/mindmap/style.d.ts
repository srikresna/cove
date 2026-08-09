import { ConnectorMode } from '../../consts/connector.js';
import { MindmapStyle } from '../../consts/mindmap.js';
import { StrokeStyle } from '../../consts/note.js';
import { FontFamily, FontWeight, TextResizing } from '../../consts/text.js';
import { type Color } from '../../themes/index.js';
import type { MindmapNode } from './mindmap.js';
export type CollapseButton = {
    width: number;
    height: number;
    radius: number;
    filled: boolean;
    fillColor: Color;
    strokeColor: Color;
    strokeWidth: number;
};
export type ExpandButton = CollapseButton & {
    fontFamily: FontFamily;
    fontSize: number;
    fontWeight: FontWeight;
    color: Color;
};
export type NodeStyle = {
    radius: number;
    strokeWidth: number;
    strokeColor: Color;
    textResizing: TextResizing;
    maxWidth: false | number;
    fontSize: number;
    fontFamily: string;
    fontWeight: FontWeight;
    color: Color;
    filled: boolean;
    fillColor: Color;
    padding: [number, number];
    shadow?: {
        blur: number;
        offsetX: number;
        offsetY: number;
        color: Color;
    };
};
export type ConnectorStyle = {
    strokeStyle: StrokeStyle;
    stroke: Color;
    strokeWidth: number;
    mode: ConnectorMode;
};
export declare const MINDMAP_NODE_MAX_WIDTH = 512;
export declare abstract class MindmapStyleGetter {
    abstract readonly root: NodeStyle;
    abstract getNodeStyle(node: MindmapNode, path: number[]): {
        connector: ConnectorStyle;
        collapseButton: CollapseButton;
        expandButton: ExpandButton;
        node: NodeStyle;
    };
}
export declare class StyleOne extends MindmapStyleGetter {
    private readonly _colorOrders;
    readonly root: {
        radius: number;
        textResizing: TextResizing;
        maxWidth: number;
        strokeWidth: number;
        strokeColor: string;
        fontFamily: FontFamily;
        fontSize: number;
        fontWeight: FontWeight;
        color: string;
        filled: boolean;
        fillColor: string;
        padding: [number, number];
        shadow: {
            offsetX: number;
            offsetY: number;
            blur: number;
            color: string;
        };
    };
    private _getColor;
    getNodeStyle(_: MindmapNode, path: number[]): {
        connector: {
            strokeStyle: StrokeStyle;
            stroke: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            strokeWidth: number;
            mode: ConnectorMode;
        };
        collapseButton: {
            width: number;
            height: number;
            radius: number;
            filled: boolean;
            fillColor: string;
            strokeColor: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            strokeWidth: number;
        };
        expandButton: {
            width: number;
            height: number;
            radius: number;
            filled: boolean;
            fillColor: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            strokeColor: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            strokeWidth: number;
            padding: number[];
            color: string;
            fontFamily: FontFamily;
            fontWeight: FontWeight;
            fontSize: number;
        };
        node: {
            radius: number;
            textResizing: TextResizing;
            maxWidth: number;
            strokeWidth: number;
            strokeColor: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            fontFamily: FontFamily;
            fontSize: number;
            fontWeight: FontWeight;
            color: string;
            filled: boolean;
            fillColor: string;
            padding: [number, number];
            shadow: {
                offsetX: number;
                offsetY: number;
                blur: number;
                color: string;
            };
        };
    };
}
export declare const styleOne: StyleOne;
export declare class StyleTwo extends MindmapStyleGetter {
    private readonly _colorOrders;
    readonly root: {
        radius: number;
        textResizing: TextResizing;
        maxWidth: number;
        strokeWidth: number;
        strokeColor: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontFamily: FontFamily;
        fontSize: number;
        fontWeight: FontWeight;
        color: string;
        filled: boolean;
        fillColor: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        padding: [number, number];
        shadow: {
            blur: number;
            offsetX: number;
            offsetY: number;
            color: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
        };
    };
    private _getColor;
    getNodeStyle(_: MindmapNode, path: number[]): {
        connector: {
            strokeStyle: StrokeStyle;
            stroke: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            strokeWidth: number;
            mode: ConnectorMode;
        };
        collapseButton: {
            width: number;
            height: number;
            radius: number;
            filled: boolean;
            fillColor: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            strokeColor: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            strokeWidth: number;
        };
        expandButton: {
            width: number;
            height: number;
            radius: number;
            filled: boolean;
            fillColor: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            padding: number[];
            strokeColor: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            strokeWidth: number;
            color: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            fontFamily: FontFamily;
            fontWeight: FontWeight;
            fontSize: number;
        };
        node: {
            radius: number;
            textResizing: TextResizing;
            maxWidth: number;
            strokeWidth: number;
            strokeColor: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            fontFamily: FontFamily;
            fontSize: number;
            fontWeight: FontWeight;
            color: string;
            filled: boolean;
            fillColor: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            padding: [number, number];
            shadow: {
                blur: number;
                offsetX: number;
                offsetY: number;
                color: string | {
                    normal: string;
                } | {
                    dark: string;
                    light: string;
                };
            };
        };
    };
}
export declare const styleTwo: StyleTwo;
export declare class StyleThree extends MindmapStyleGetter {
    private readonly _strokeColor;
    readonly root: {
        radius: number;
        textResizing: TextResizing;
        maxWidth: number;
        strokeWidth: number;
        strokeColor: string;
        fontFamily: FontFamily;
        fontSize: number;
        fontWeight: FontWeight;
        color: string;
        filled: boolean;
        fillColor: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        padding: [number, number];
        shadow: {
            blur: number;
            offsetX: number;
            offsetY: number;
            color: string;
        };
    };
    private _getColor;
    getNodeStyle(_: MindmapNode, path: number[]): {
        node: {
            radius: number;
            textResizing: TextResizing;
            maxWidth: number;
            strokeWidth: number;
            strokeColor: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            fontFamily: FontFamily;
            fontSize: number;
            fontWeight: FontWeight;
            color: string;
            filled: boolean;
            fillColor: string;
            padding: [number, number];
            shadow: {
                blur: number;
                offsetX: number;
                offsetY: number;
                color: string;
            };
        };
        collapseButton: {
            width: number;
            height: number;
            radius: number;
            filled: boolean;
            fillColor: string;
            strokeColor: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            strokeWidth: number;
        };
        expandButton: {
            width: number;
            height: number;
            radius: number;
            filled: boolean;
            fillColor: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            padding: number[];
            strokeColor: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            strokeWidth: number;
            color: string;
            fontFamily: FontFamily;
            fontWeight: FontWeight;
            fontSize: number;
        };
        connector: {
            strokeStyle: StrokeStyle;
            stroke: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            strokeWidth: number;
            mode: ConnectorMode;
        };
    };
}
export declare const styleThree: StyleThree;
export declare class StyleFour extends MindmapStyleGetter {
    private readonly _colors;
    readonly root: {
        radius: number;
        textResizing: TextResizing;
        maxWidth: number;
        strokeWidth: number;
        strokeColor: string;
        fontFamily: FontFamily;
        fontSize: number;
        fontWeight: FontWeight;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        filled: boolean;
        fillColor: string;
        padding: [number, number];
    };
    private _getColor;
    getNodeStyle(_: MindmapNode, path: number[]): {
        connector: {
            strokeStyle: StrokeStyle;
            stroke: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            strokeWidth: number;
            mode: ConnectorMode;
        };
        collapseButton: {
            width: number;
            height: number;
            radius: number;
            filled: boolean;
            fillColor: string;
            strokeColor: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            strokeWidth: number;
        };
        expandButton: {
            width: number;
            height: number;
            radius: number;
            filled: boolean;
            fillColor: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            padding: number[];
            strokeColor: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            strokeWidth: number;
            color: string;
            fontFamily: FontFamily;
            fontWeight: FontWeight;
            fontSize: number;
        };
        node: {
            fontSize: number;
            padding: [number, number];
            radius: number;
            textResizing: TextResizing;
            maxWidth: number;
            strokeWidth: number;
            strokeColor: string;
            fontFamily: FontFamily;
            fontWeight: FontWeight;
            color: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            filled: boolean;
            fillColor: string;
        };
    };
}
export declare const styleFour: StyleFour;
export declare const mindmapStyleGetters: Record<MindmapStyle, MindmapStyleGetter>;
export declare const applyNodeStyle: (node: MindmapNode, nodeStyle: NodeStyle) => void;
//# sourceMappingURL=style.d.ts.map