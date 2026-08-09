import type { DeepPartial } from '@blocksuite/global/utils';
import type { ExtensionType } from '@blocksuite/store';
import type { Signal } from '@preact/signals-core';
import { z } from 'zod';
export declare const GeneralSettingSchema: z.ZodObject<{
    edgelessScrollZoom: z.ZodDefault<z.ZodBoolean>;
    edgelessDisableScheduleUpdate: z.ZodDefault<z.ZodBoolean>;
    docCanvasPreferView: z.ZodDefault<z.ZodEnum<["affine:embed-linked-doc", "affine:embed-synced-doc"]>>;
} & {
    connector: z.ZodDefault<z.ZodObject<{
        frontEndpointStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").PointStyle>;
        rearEndpointStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").PointStyle>;
        stroke: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        strokeStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").StrokeStyle>;
        strokeWidth: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").LineWidth>;
        rough: z.ZodBoolean;
        mode: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").ConnectorMode>;
        labelStyle: z.ZodObject<{
            color: z.ZodUnion<[z.ZodString, z.ZodObject<{
                normal: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                normal: string;
            }, {
                normal: string;
            }>, z.ZodObject<{
                dark: z.ZodString;
                light: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                dark: string;
                light: string;
            }, {
                dark: string;
                light: string;
            }>]>;
            fontSize: z.ZodNumber;
            fontFamily: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontFamily>;
            fontWeight: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontWeight>;
            fontStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontStyle>;
            textAlign: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextAlign>;
        }, "strip", z.ZodTypeAny, {
            textAlign: import("@blocksuite/affine-model").TextAlign;
            color: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            fontSize: number;
            fontFamily: import("@blocksuite/affine-model").FontFamily;
            fontWeight: import("@blocksuite/affine-model").FontWeight;
            fontStyle: import("@blocksuite/affine-model").FontStyle;
        }, {
            textAlign: import("@blocksuite/affine-model").TextAlign;
            color: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            fontSize: number;
            fontFamily: import("@blocksuite/affine-model").FontFamily;
            fontWeight: import("@blocksuite/affine-model").FontWeight;
            fontStyle: import("@blocksuite/affine-model").FontStyle;
        }>;
    }, "strip", z.ZodTypeAny, {
        mode: import("@blocksuite/affine-model").ConnectorMode;
        frontEndpointStyle: import("@blocksuite/affine-model").PointStyle;
        rearEndpointStyle: import("@blocksuite/affine-model").PointStyle;
        stroke: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: import("@blocksuite/affine-model").LineWidth;
        rough: boolean;
        labelStyle: {
            textAlign: import("@blocksuite/affine-model").TextAlign;
            color: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            fontSize: number;
            fontFamily: import("@blocksuite/affine-model").FontFamily;
            fontWeight: import("@blocksuite/affine-model").FontWeight;
            fontStyle: import("@blocksuite/affine-model").FontStyle;
        };
    }, {
        mode: import("@blocksuite/affine-model").ConnectorMode;
        frontEndpointStyle: import("@blocksuite/affine-model").PointStyle;
        rearEndpointStyle: import("@blocksuite/affine-model").PointStyle;
        stroke: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: import("@blocksuite/affine-model").LineWidth;
        rough: boolean;
        labelStyle: {
            textAlign: import("@blocksuite/affine-model").TextAlign;
            color: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            fontSize: number;
            fontFamily: import("@blocksuite/affine-model").FontFamily;
            fontWeight: import("@blocksuite/affine-model").FontWeight;
            fontStyle: import("@blocksuite/affine-model").FontStyle;
        };
    }>>;
    brush: z.ZodDefault<z.ZodObject<{
        color: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        lineWidth: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").LineWidth>;
    }, "strip", z.ZodTypeAny, {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        lineWidth: import("@blocksuite/affine-model").LineWidth;
    }, {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        lineWidth: import("@blocksuite/affine-model").LineWidth;
    }>>;
    highlighter: z.ZodDefault<z.ZodObject<{
        color: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        lineWidth: z.ZodEffects<z.ZodNumber, number, number>;
    }, "strip", z.ZodTypeAny, {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        lineWidth: number;
    }, {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        lineWidth: number;
    }>>;
    text: z.ZodDefault<z.ZodObject<{
        color: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        fontSize: z.ZodNumber;
        fontFamily: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontFamily>;
        fontWeight: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontWeight>;
        fontStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontStyle>;
        textAlign: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextAlign>;
    }, "strip", z.ZodTypeAny, {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
    }, {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
    }>>;
    mindmap: z.ZodDefault<z.ZodObject<{
        layoutType: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").LayoutType>;
        style: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").MindmapStyle>;
    }, "strip", z.ZodTypeAny, {
        style: import("@blocksuite/affine-model").MindmapStyle;
        layoutType: import("@blocksuite/affine-model").LayoutType;
    }, {
        style: import("@blocksuite/affine-model").MindmapStyle;
        layoutType: import("@blocksuite/affine-model").LayoutType;
    }>>;
    'affine:edgeless-text': z.ZodDefault<z.ZodObject<{
        color: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        fontFamily: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontFamily>;
        fontStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontStyle>;
        fontWeight: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontWeight>;
        textAlign: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextAlign>;
    }, "strip", z.ZodTypeAny, {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        textAlign: import("@blocksuite/affine-model").TextAlign;
    }, {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        textAlign: import("@blocksuite/affine-model").TextAlign;
    }>>;
    'affine:note': z.ZodDefault<z.ZodObject<{
        background: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        displayMode: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").NoteDisplayMode>;
        edgeless: z.ZodObject<{
            style: z.ZodObject<{
                borderRadius: z.ZodNumber;
                borderSize: z.ZodNumber;
                borderStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").StrokeStyle>;
                shadowType: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").NoteShadow>;
            }, "strip", z.ZodTypeAny, {
                borderRadius: number;
                borderSize: number;
                borderStyle: import("@blocksuite/affine-model").StrokeStyle;
                shadowType: import("@blocksuite/affine-model").NoteShadow;
            }, {
                borderRadius: number;
                borderSize: number;
                borderStyle: import("@blocksuite/affine-model").StrokeStyle;
                shadowType: import("@blocksuite/affine-model").NoteShadow;
            }>;
        }, "strip", z.ZodTypeAny, {
            style: {
                borderRadius: number;
                borderSize: number;
                borderStyle: import("@blocksuite/affine-model").StrokeStyle;
                shadowType: import("@blocksuite/affine-model").NoteShadow;
            };
        }, {
            style: {
                borderRadius: number;
                borderSize: number;
                borderStyle: import("@blocksuite/affine-model").StrokeStyle;
                shadowType: import("@blocksuite/affine-model").NoteShadow;
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        edgeless: {
            style: {
                borderRadius: number;
                borderSize: number;
                borderStyle: import("@blocksuite/affine-model").StrokeStyle;
                shadowType: import("@blocksuite/affine-model").NoteShadow;
            };
        };
        background: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        displayMode: import("@blocksuite/affine-model").NoteDisplayMode;
    }, {
        edgeless: {
            style: {
                borderRadius: number;
                borderSize: number;
                borderStyle: import("@blocksuite/affine-model").StrokeStyle;
                shadowType: import("@blocksuite/affine-model").NoteShadow;
            };
        };
        background: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        displayMode: import("@blocksuite/affine-model").NoteDisplayMode;
    }>>;
    'affine:frame': z.ZodDefault<z.ZodObject<{
        background: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
    }, "strip", z.ZodTypeAny, {
        background: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }, {
        background: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }>>;
    'shape:diamond': z.ZodDefault<z.ZodObject<{
        color: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        fillColor: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        strokeColor: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        strokeStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").StrokeStyle>;
        strokeWidth: z.ZodNumber;
        shapeStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").ShapeStyle>;
        filled: z.ZodBoolean;
        radius: z.ZodNumber;
        fontSize: z.ZodNumber;
        fontFamily: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontFamily>;
        fontWeight: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontWeight>;
        fontStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontStyle>;
        textAlign: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextAlign>;
        textHorizontalAlign: z.ZodOptional<z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextAlign>>;
        textVerticalAlign: z.ZodOptional<z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextVerticalAlign>>;
        roughness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    }, {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    }>>;
    'shape:ellipse': z.ZodDefault<z.ZodObject<{
        color: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        fillColor: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        strokeColor: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        strokeStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").StrokeStyle>;
        strokeWidth: z.ZodNumber;
        shapeStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").ShapeStyle>;
        filled: z.ZodBoolean;
        radius: z.ZodNumber;
        fontSize: z.ZodNumber;
        fontFamily: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontFamily>;
        fontWeight: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontWeight>;
        fontStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontStyle>;
        textAlign: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextAlign>;
        textHorizontalAlign: z.ZodOptional<z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextAlign>>;
        textVerticalAlign: z.ZodOptional<z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextVerticalAlign>>;
        roughness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    }, {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    }>>;
    'shape:rect': z.ZodDefault<z.ZodObject<{
        color: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        fillColor: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        strokeColor: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        strokeStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").StrokeStyle>;
        strokeWidth: z.ZodNumber;
        shapeStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").ShapeStyle>;
        filled: z.ZodBoolean;
        radius: z.ZodNumber;
        fontSize: z.ZodNumber;
        fontFamily: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontFamily>;
        fontWeight: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontWeight>;
        fontStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontStyle>;
        textAlign: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextAlign>;
        textHorizontalAlign: z.ZodOptional<z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextAlign>>;
        textVerticalAlign: z.ZodOptional<z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextVerticalAlign>>;
        roughness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    }, {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    }>>;
    'shape:triangle': z.ZodDefault<z.ZodObject<{
        color: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        fillColor: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        strokeColor: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        strokeStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").StrokeStyle>;
        strokeWidth: z.ZodNumber;
        shapeStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").ShapeStyle>;
        filled: z.ZodBoolean;
        radius: z.ZodNumber;
        fontSize: z.ZodNumber;
        fontFamily: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontFamily>;
        fontWeight: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontWeight>;
        fontStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontStyle>;
        textAlign: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextAlign>;
        textHorizontalAlign: z.ZodOptional<z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextAlign>>;
        textVerticalAlign: z.ZodOptional<z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextVerticalAlign>>;
        roughness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    }, {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    }>>;
    'shape:roundedRect': z.ZodDefault<z.ZodObject<{
        color: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        fillColor: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        strokeColor: z.ZodUnion<[z.ZodString, z.ZodObject<{
            normal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            normal: string;
        }, {
            normal: string;
        }>, z.ZodObject<{
            dark: z.ZodString;
            light: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dark: string;
            light: string;
        }, {
            dark: string;
            light: string;
        }>]>;
        strokeStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").StrokeStyle>;
        strokeWidth: z.ZodNumber;
        shapeStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").ShapeStyle>;
        filled: z.ZodBoolean;
        radius: z.ZodNumber;
        fontSize: z.ZodNumber;
        fontFamily: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontFamily>;
        fontWeight: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontWeight>;
        fontStyle: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").FontStyle>;
        textAlign: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextAlign>;
        textHorizontalAlign: z.ZodOptional<z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextAlign>>;
        textVerticalAlign: z.ZodOptional<z.ZodNativeEnum<typeof import("@blocksuite/affine-model").TextVerticalAlign>>;
        roughness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    }, {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    text: {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
    };
    brush: {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        lineWidth: import("@blocksuite/affine-model").LineWidth;
    };
    highlighter: {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        lineWidth: number;
    };
    'affine:note': {
        edgeless: {
            style: {
                borderRadius: number;
                borderSize: number;
                borderStyle: import("@blocksuite/affine-model").StrokeStyle;
                shadowType: import("@blocksuite/affine-model").NoteShadow;
            };
        };
        background: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        displayMode: import("@blocksuite/affine-model").NoteDisplayMode;
    };
    connector: {
        mode: import("@blocksuite/affine-model").ConnectorMode;
        frontEndpointStyle: import("@blocksuite/affine-model").PointStyle;
        rearEndpointStyle: import("@blocksuite/affine-model").PointStyle;
        stroke: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: import("@blocksuite/affine-model").LineWidth;
        rough: boolean;
        labelStyle: {
            textAlign: import("@blocksuite/affine-model").TextAlign;
            color: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            fontSize: number;
            fontFamily: import("@blocksuite/affine-model").FontFamily;
            fontWeight: import("@blocksuite/affine-model").FontWeight;
            fontStyle: import("@blocksuite/affine-model").FontStyle;
        };
    };
    mindmap: {
        style: import("@blocksuite/affine-model").MindmapStyle;
        layoutType: import("@blocksuite/affine-model").LayoutType;
    };
    'affine:edgeless-text': {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        textAlign: import("@blocksuite/affine-model").TextAlign;
    };
    'affine:frame': {
        background: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    };
    'shape:diamond': {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    };
    'shape:ellipse': {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    };
    'shape:rect': {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    };
    'shape:triangle': {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    };
    'shape:roundedRect': {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    };
    edgelessScrollZoom: boolean;
    edgelessDisableScheduleUpdate: boolean;
    docCanvasPreferView: "affine:embed-linked-doc" | "affine:embed-synced-doc";
}, {
    text?: {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
    } | undefined;
    brush?: {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        lineWidth: import("@blocksuite/affine-model").LineWidth;
    } | undefined;
    highlighter?: {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        lineWidth: number;
    } | undefined;
    'affine:note'?: {
        edgeless: {
            style: {
                borderRadius: number;
                borderSize: number;
                borderStyle: import("@blocksuite/affine-model").StrokeStyle;
                shadowType: import("@blocksuite/affine-model").NoteShadow;
            };
        };
        background: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        displayMode: import("@blocksuite/affine-model").NoteDisplayMode;
    } | undefined;
    connector?: {
        mode: import("@blocksuite/affine-model").ConnectorMode;
        frontEndpointStyle: import("@blocksuite/affine-model").PointStyle;
        rearEndpointStyle: import("@blocksuite/affine-model").PointStyle;
        stroke: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: import("@blocksuite/affine-model").LineWidth;
        rough: boolean;
        labelStyle: {
            textAlign: import("@blocksuite/affine-model").TextAlign;
            color: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            fontSize: number;
            fontFamily: import("@blocksuite/affine-model").FontFamily;
            fontWeight: import("@blocksuite/affine-model").FontWeight;
            fontStyle: import("@blocksuite/affine-model").FontStyle;
        };
    } | undefined;
    mindmap?: {
        style: import("@blocksuite/affine-model").MindmapStyle;
        layoutType: import("@blocksuite/affine-model").LayoutType;
    } | undefined;
    'affine:edgeless-text'?: {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        textAlign: import("@blocksuite/affine-model").TextAlign;
    } | undefined;
    'affine:frame'?: {
        background: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    } | undefined;
    'shape:diamond'?: {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    } | undefined;
    'shape:ellipse'?: {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    } | undefined;
    'shape:rect'?: {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    } | undefined;
    'shape:triangle'?: {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    } | undefined;
    'shape:roundedRect'?: {
        textAlign: import("@blocksuite/affine-model").TextAlign;
        radius: number;
        strokeStyle: import("@blocksuite/affine-model").StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: import("@blocksuite/affine-model").FontFamily;
        fontWeight: import("@blocksuite/affine-model").FontWeight;
        fontStyle: import("@blocksuite/affine-model").FontStyle;
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
        shapeStyle: import("@blocksuite/affine-model").ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: import("@blocksuite/affine-model").TextAlign | undefined;
        textVerticalAlign?: import("@blocksuite/affine-model").TextVerticalAlign | undefined;
    } | undefined;
    edgelessScrollZoom?: boolean | undefined;
    edgelessDisableScheduleUpdate?: boolean | undefined;
    docCanvasPreferView?: "affine:embed-linked-doc" | "affine:embed-synced-doc" | undefined;
}>;
export type EditorSetting = z.infer<typeof GeneralSettingSchema>;
export interface EditorSettingService {
    setting$: Signal<DeepPartial<EditorSetting>>;
    set?: (key: keyof EditorSetting, value: EditorSetting[keyof EditorSetting]) => void;
}
export declare const EditorSettingProvider: import("@blocksuite/global/di").ServiceIdentifier<EditorSettingService> & (<U extends EditorSettingService = EditorSettingService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function EditorSettingExtension(service: EditorSettingService): ExtensionType;
//# sourceMappingURL=editor-setting-service.d.ts.map