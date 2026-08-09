import { ConnectorMode, FontFamily, FontStyle, FontWeight, LayoutType, LineWidth, MindmapStyle, PointStyle, ShapeStyle, StrokeStyle, TextAlign, TextVerticalAlign } from '@blocksuite/affine-model';
import { z, type ZodTypeAny } from 'zod';
export declare const ConnectorSchema: z.ZodDefault<z.ZodObject<{
    frontEndpointStyle: z.ZodNativeEnum<typeof PointStyle>;
    rearEndpointStyle: z.ZodNativeEnum<typeof PointStyle>;
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
    strokeStyle: z.ZodNativeEnum<typeof StrokeStyle>;
    strokeWidth: z.ZodNativeEnum<typeof LineWidth>;
    rough: z.ZodBoolean;
    mode: z.ZodNativeEnum<typeof ConnectorMode>;
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
        fontFamily: z.ZodNativeEnum<typeof FontFamily>;
        fontWeight: z.ZodNativeEnum<typeof FontWeight>;
        fontStyle: z.ZodNativeEnum<typeof FontStyle>;
        textAlign: z.ZodNativeEnum<typeof TextAlign>;
    }, "strip", z.ZodTypeAny, {
        textAlign: TextAlign;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
    }, {
        textAlign: TextAlign;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
    }>;
}, "strip", z.ZodTypeAny, {
    mode: ConnectorMode;
    frontEndpointStyle: PointStyle;
    rearEndpointStyle: PointStyle;
    stroke: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    strokeStyle: StrokeStyle;
    strokeWidth: LineWidth;
    rough: boolean;
    labelStyle: {
        textAlign: TextAlign;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
    };
}, {
    mode: ConnectorMode;
    frontEndpointStyle: PointStyle;
    rearEndpointStyle: PointStyle;
    stroke: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    strokeStyle: StrokeStyle;
    strokeWidth: LineWidth;
    rough: boolean;
    labelStyle: {
        textAlign: TextAlign;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
    };
}>>;
export declare const BrushSchema: z.ZodDefault<z.ZodObject<{
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
    lineWidth: z.ZodNativeEnum<typeof LineWidth>;
}, "strip", z.ZodTypeAny, {
    color: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    lineWidth: LineWidth;
}, {
    color: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    lineWidth: LineWidth;
}>>;
export declare const HighlighterSchema: z.ZodDefault<z.ZodObject<{
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
export declare const ShapeSchema: z.ZodDefault<z.ZodObject<{
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
    strokeStyle: z.ZodNativeEnum<typeof StrokeStyle>;
    strokeWidth: z.ZodNumber;
    shapeStyle: z.ZodNativeEnum<typeof ShapeStyle>;
    filled: z.ZodBoolean;
    radius: z.ZodNumber;
    fontSize: z.ZodNumber;
    fontFamily: z.ZodNativeEnum<typeof FontFamily>;
    fontWeight: z.ZodNativeEnum<typeof FontWeight>;
    fontStyle: z.ZodNativeEnum<typeof FontStyle>;
    textAlign: z.ZodNativeEnum<typeof TextAlign>;
    textHorizontalAlign: z.ZodOptional<z.ZodNativeEnum<typeof TextAlign>>;
    textVerticalAlign: z.ZodOptional<z.ZodNativeEnum<typeof TextVerticalAlign>>;
    roughness: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    textAlign: TextAlign;
    radius: number;
    strokeStyle: StrokeStyle;
    strokeWidth: number;
    color: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    fontSize: number;
    fontFamily: FontFamily;
    fontWeight: FontWeight;
    fontStyle: FontStyle;
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
    shapeStyle: ShapeStyle;
    filled: boolean;
    roughness: number;
    textHorizontalAlign?: TextAlign | undefined;
    textVerticalAlign?: TextVerticalAlign | undefined;
}, {
    textAlign: TextAlign;
    radius: number;
    strokeStyle: StrokeStyle;
    strokeWidth: number;
    color: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    fontSize: number;
    fontFamily: FontFamily;
    fontWeight: FontWeight;
    fontStyle: FontStyle;
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
    shapeStyle: ShapeStyle;
    filled: boolean;
    roughness: number;
    textHorizontalAlign?: TextAlign | undefined;
    textVerticalAlign?: TextVerticalAlign | undefined;
}>>;
export declare const RoundedShapeSchema: z.ZodDefault<z.ZodObject<{
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
    strokeStyle: z.ZodNativeEnum<typeof StrokeStyle>;
    strokeWidth: z.ZodNumber;
    shapeStyle: z.ZodNativeEnum<typeof ShapeStyle>;
    filled: z.ZodBoolean;
    radius: z.ZodNumber;
    fontSize: z.ZodNumber;
    fontFamily: z.ZodNativeEnum<typeof FontFamily>;
    fontWeight: z.ZodNativeEnum<typeof FontWeight>;
    fontStyle: z.ZodNativeEnum<typeof FontStyle>;
    textAlign: z.ZodNativeEnum<typeof TextAlign>;
    textHorizontalAlign: z.ZodOptional<z.ZodNativeEnum<typeof TextAlign>>;
    textVerticalAlign: z.ZodOptional<z.ZodNativeEnum<typeof TextVerticalAlign>>;
    roughness: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    textAlign: TextAlign;
    radius: number;
    strokeStyle: StrokeStyle;
    strokeWidth: number;
    color: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    fontSize: number;
    fontFamily: FontFamily;
    fontWeight: FontWeight;
    fontStyle: FontStyle;
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
    shapeStyle: ShapeStyle;
    filled: boolean;
    roughness: number;
    textHorizontalAlign?: TextAlign | undefined;
    textVerticalAlign?: TextVerticalAlign | undefined;
}, {
    textAlign: TextAlign;
    radius: number;
    strokeStyle: StrokeStyle;
    strokeWidth: number;
    color: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    fontSize: number;
    fontFamily: FontFamily;
    fontWeight: FontWeight;
    fontStyle: FontStyle;
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
    shapeStyle: ShapeStyle;
    filled: boolean;
    roughness: number;
    textHorizontalAlign?: TextAlign | undefined;
    textVerticalAlign?: TextVerticalAlign | undefined;
}>>;
export declare const TextSchema: z.ZodDefault<z.ZodObject<{
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
    fontFamily: z.ZodNativeEnum<typeof FontFamily>;
    fontWeight: z.ZodNativeEnum<typeof FontWeight>;
    fontStyle: z.ZodNativeEnum<typeof FontStyle>;
    textAlign: z.ZodNativeEnum<typeof TextAlign>;
}, "strip", z.ZodTypeAny, {
    textAlign: TextAlign;
    color: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    fontSize: number;
    fontFamily: FontFamily;
    fontWeight: FontWeight;
    fontStyle: FontStyle;
}, {
    textAlign: TextAlign;
    color: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    fontSize: number;
    fontFamily: FontFamily;
    fontWeight: FontWeight;
    fontStyle: FontStyle;
}>>;
export declare const MindmapSchema: z.ZodDefault<z.ZodObject<{
    layoutType: z.ZodNativeEnum<typeof LayoutType>;
    style: z.ZodNativeEnum<typeof MindmapStyle>;
}, "strip", z.ZodTypeAny, {
    style: MindmapStyle;
    layoutType: LayoutType;
}, {
    style: MindmapStyle;
    layoutType: LayoutType;
}>>;
export declare const NodePropsSchema: z.ZodObject<{
    connector: z.ZodDefault<z.ZodObject<{
        frontEndpointStyle: z.ZodNativeEnum<typeof PointStyle>;
        rearEndpointStyle: z.ZodNativeEnum<typeof PointStyle>;
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
        strokeStyle: z.ZodNativeEnum<typeof StrokeStyle>;
        strokeWidth: z.ZodNativeEnum<typeof LineWidth>;
        rough: z.ZodBoolean;
        mode: z.ZodNativeEnum<typeof ConnectorMode>;
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
            fontFamily: z.ZodNativeEnum<typeof FontFamily>;
            fontWeight: z.ZodNativeEnum<typeof FontWeight>;
            fontStyle: z.ZodNativeEnum<typeof FontStyle>;
            textAlign: z.ZodNativeEnum<typeof TextAlign>;
        }, "strip", z.ZodTypeAny, {
            textAlign: TextAlign;
            color: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            fontSize: number;
            fontFamily: FontFamily;
            fontWeight: FontWeight;
            fontStyle: FontStyle;
        }, {
            textAlign: TextAlign;
            color: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            fontSize: number;
            fontFamily: FontFamily;
            fontWeight: FontWeight;
            fontStyle: FontStyle;
        }>;
    }, "strip", z.ZodTypeAny, {
        mode: ConnectorMode;
        frontEndpointStyle: PointStyle;
        rearEndpointStyle: PointStyle;
        stroke: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        strokeStyle: StrokeStyle;
        strokeWidth: LineWidth;
        rough: boolean;
        labelStyle: {
            textAlign: TextAlign;
            color: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            fontSize: number;
            fontFamily: FontFamily;
            fontWeight: FontWeight;
            fontStyle: FontStyle;
        };
    }, {
        mode: ConnectorMode;
        frontEndpointStyle: PointStyle;
        rearEndpointStyle: PointStyle;
        stroke: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        strokeStyle: StrokeStyle;
        strokeWidth: LineWidth;
        rough: boolean;
        labelStyle: {
            textAlign: TextAlign;
            color: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            fontSize: number;
            fontFamily: FontFamily;
            fontWeight: FontWeight;
            fontStyle: FontStyle;
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
        lineWidth: z.ZodNativeEnum<typeof LineWidth>;
    }, "strip", z.ZodTypeAny, {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        lineWidth: LineWidth;
    }, {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        lineWidth: LineWidth;
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
        fontFamily: z.ZodNativeEnum<typeof FontFamily>;
        fontWeight: z.ZodNativeEnum<typeof FontWeight>;
        fontStyle: z.ZodNativeEnum<typeof FontStyle>;
        textAlign: z.ZodNativeEnum<typeof TextAlign>;
    }, "strip", z.ZodTypeAny, {
        textAlign: TextAlign;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
    }, {
        textAlign: TextAlign;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
    }>>;
    mindmap: z.ZodDefault<z.ZodObject<{
        layoutType: z.ZodNativeEnum<typeof LayoutType>;
        style: z.ZodNativeEnum<typeof MindmapStyle>;
    }, "strip", z.ZodTypeAny, {
        style: MindmapStyle;
        layoutType: LayoutType;
    }, {
        style: MindmapStyle;
        layoutType: LayoutType;
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
        fontFamily: z.ZodNativeEnum<typeof FontFamily>;
        fontStyle: z.ZodNativeEnum<typeof FontStyle>;
        fontWeight: z.ZodNativeEnum<typeof FontWeight>;
        textAlign: z.ZodNativeEnum<typeof TextAlign>;
    }, "strip", z.ZodTypeAny, {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontFamily: FontFamily;
        fontStyle: FontStyle;
        fontWeight: FontWeight;
        textAlign: TextAlign;
    }, {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontFamily: FontFamily;
        fontStyle: FontStyle;
        fontWeight: FontWeight;
        textAlign: TextAlign;
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
                borderStyle: z.ZodNativeEnum<typeof StrokeStyle>;
                shadowType: z.ZodNativeEnum<typeof import("@blocksuite/affine-model").NoteShadow>;
            }, "strip", z.ZodTypeAny, {
                borderRadius: number;
                borderSize: number;
                borderStyle: StrokeStyle;
                shadowType: import("@blocksuite/affine-model").NoteShadow;
            }, {
                borderRadius: number;
                borderSize: number;
                borderStyle: StrokeStyle;
                shadowType: import("@blocksuite/affine-model").NoteShadow;
            }>;
        }, "strip", z.ZodTypeAny, {
            style: {
                borderRadius: number;
                borderSize: number;
                borderStyle: StrokeStyle;
                shadowType: import("@blocksuite/affine-model").NoteShadow;
            };
        }, {
            style: {
                borderRadius: number;
                borderSize: number;
                borderStyle: StrokeStyle;
                shadowType: import("@blocksuite/affine-model").NoteShadow;
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        edgeless: {
            style: {
                borderRadius: number;
                borderSize: number;
                borderStyle: StrokeStyle;
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
                borderStyle: StrokeStyle;
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
        strokeStyle: z.ZodNativeEnum<typeof StrokeStyle>;
        strokeWidth: z.ZodNumber;
        shapeStyle: z.ZodNativeEnum<typeof ShapeStyle>;
        filled: z.ZodBoolean;
        radius: z.ZodNumber;
        fontSize: z.ZodNumber;
        fontFamily: z.ZodNativeEnum<typeof FontFamily>;
        fontWeight: z.ZodNativeEnum<typeof FontWeight>;
        fontStyle: z.ZodNativeEnum<typeof FontStyle>;
        textAlign: z.ZodNativeEnum<typeof TextAlign>;
        textHorizontalAlign: z.ZodOptional<z.ZodNativeEnum<typeof TextAlign>>;
        textVerticalAlign: z.ZodOptional<z.ZodNativeEnum<typeof TextVerticalAlign>>;
        roughness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
    }, {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
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
        strokeStyle: z.ZodNativeEnum<typeof StrokeStyle>;
        strokeWidth: z.ZodNumber;
        shapeStyle: z.ZodNativeEnum<typeof ShapeStyle>;
        filled: z.ZodBoolean;
        radius: z.ZodNumber;
        fontSize: z.ZodNumber;
        fontFamily: z.ZodNativeEnum<typeof FontFamily>;
        fontWeight: z.ZodNativeEnum<typeof FontWeight>;
        fontStyle: z.ZodNativeEnum<typeof FontStyle>;
        textAlign: z.ZodNativeEnum<typeof TextAlign>;
        textHorizontalAlign: z.ZodOptional<z.ZodNativeEnum<typeof TextAlign>>;
        textVerticalAlign: z.ZodOptional<z.ZodNativeEnum<typeof TextVerticalAlign>>;
        roughness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
    }, {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
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
        strokeStyle: z.ZodNativeEnum<typeof StrokeStyle>;
        strokeWidth: z.ZodNumber;
        shapeStyle: z.ZodNativeEnum<typeof ShapeStyle>;
        filled: z.ZodBoolean;
        radius: z.ZodNumber;
        fontSize: z.ZodNumber;
        fontFamily: z.ZodNativeEnum<typeof FontFamily>;
        fontWeight: z.ZodNativeEnum<typeof FontWeight>;
        fontStyle: z.ZodNativeEnum<typeof FontStyle>;
        textAlign: z.ZodNativeEnum<typeof TextAlign>;
        textHorizontalAlign: z.ZodOptional<z.ZodNativeEnum<typeof TextAlign>>;
        textVerticalAlign: z.ZodOptional<z.ZodNativeEnum<typeof TextVerticalAlign>>;
        roughness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
    }, {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
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
        strokeStyle: z.ZodNativeEnum<typeof StrokeStyle>;
        strokeWidth: z.ZodNumber;
        shapeStyle: z.ZodNativeEnum<typeof ShapeStyle>;
        filled: z.ZodBoolean;
        radius: z.ZodNumber;
        fontSize: z.ZodNumber;
        fontFamily: z.ZodNativeEnum<typeof FontFamily>;
        fontWeight: z.ZodNativeEnum<typeof FontWeight>;
        fontStyle: z.ZodNativeEnum<typeof FontStyle>;
        textAlign: z.ZodNativeEnum<typeof TextAlign>;
        textHorizontalAlign: z.ZodOptional<z.ZodNativeEnum<typeof TextAlign>>;
        textVerticalAlign: z.ZodOptional<z.ZodNativeEnum<typeof TextVerticalAlign>>;
        roughness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
    }, {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
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
        strokeStyle: z.ZodNativeEnum<typeof StrokeStyle>;
        strokeWidth: z.ZodNumber;
        shapeStyle: z.ZodNativeEnum<typeof ShapeStyle>;
        filled: z.ZodBoolean;
        radius: z.ZodNumber;
        fontSize: z.ZodNumber;
        fontFamily: z.ZodNativeEnum<typeof FontFamily>;
        fontWeight: z.ZodNativeEnum<typeof FontWeight>;
        fontStyle: z.ZodNativeEnum<typeof FontStyle>;
        textAlign: z.ZodNativeEnum<typeof TextAlign>;
        textHorizontalAlign: z.ZodOptional<z.ZodNativeEnum<typeof TextAlign>>;
        textVerticalAlign: z.ZodOptional<z.ZodNativeEnum<typeof TextVerticalAlign>>;
        roughness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
    }, {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    text: {
        textAlign: TextAlign;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
    };
    brush: {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        lineWidth: LineWidth;
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
                borderStyle: StrokeStyle;
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
        mode: ConnectorMode;
        frontEndpointStyle: PointStyle;
        rearEndpointStyle: PointStyle;
        stroke: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        strokeStyle: StrokeStyle;
        strokeWidth: LineWidth;
        rough: boolean;
        labelStyle: {
            textAlign: TextAlign;
            color: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            fontSize: number;
            fontFamily: FontFamily;
            fontWeight: FontWeight;
            fontStyle: FontStyle;
        };
    };
    mindmap: {
        style: MindmapStyle;
        layoutType: LayoutType;
    };
    'affine:edgeless-text': {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontFamily: FontFamily;
        fontStyle: FontStyle;
        fontWeight: FontWeight;
        textAlign: TextAlign;
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
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
    };
    'shape:ellipse': {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
    };
    'shape:rect': {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
    };
    'shape:triangle': {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
    };
    'shape:roundedRect': {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
    };
}, {
    text?: {
        textAlign: TextAlign;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
    } | undefined;
    brush?: {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        lineWidth: LineWidth;
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
                borderStyle: StrokeStyle;
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
        mode: ConnectorMode;
        frontEndpointStyle: PointStyle;
        rearEndpointStyle: PointStyle;
        stroke: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        strokeStyle: StrokeStyle;
        strokeWidth: LineWidth;
        rough: boolean;
        labelStyle: {
            textAlign: TextAlign;
            color: string | {
                normal: string;
            } | {
                dark: string;
                light: string;
            };
            fontSize: number;
            fontFamily: FontFamily;
            fontWeight: FontWeight;
            fontStyle: FontStyle;
        };
    } | undefined;
    mindmap?: {
        style: MindmapStyle;
        layoutType: LayoutType;
    } | undefined;
    'affine:edgeless-text'?: {
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontFamily: FontFamily;
        fontStyle: FontStyle;
        fontWeight: FontWeight;
        textAlign: TextAlign;
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
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
    } | undefined;
    'shape:ellipse'?: {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
    } | undefined;
    'shape:rect'?: {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
    } | undefined;
    'shape:triangle'?: {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
    } | undefined;
    'shape:roundedRect'?: {
        textAlign: TextAlign;
        radius: number;
        strokeStyle: StrokeStyle;
        strokeWidth: number;
        color: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
        fontSize: number;
        fontFamily: FontFamily;
        fontWeight: FontWeight;
        fontStyle: FontStyle;
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
        shapeStyle: ShapeStyle;
        filled: boolean;
        roughness: number;
        textHorizontalAlign?: TextAlign | undefined;
        textVerticalAlign?: TextVerticalAlign | undefined;
    } | undefined;
}>;
export type NodeProps = z.infer<typeof NodePropsSchema>;
export declare function makeDeepOptional(schema: ZodTypeAny): ZodTypeAny;
//# sourceMappingURL=zod-schema.d.ts.map