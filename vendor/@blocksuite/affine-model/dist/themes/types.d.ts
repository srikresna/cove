import { z } from 'zod';
export declare const PaletteSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
    key: string;
    value: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
}, {
    key: string;
    value: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
}>;
export type Palette = z.infer<typeof PaletteSchema>;
export declare const ThemeSchema: z.ZodObject<{
    pureBlack: z.ZodString;
    pureWhite: z.ZodString;
    black: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
    white: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
    transparent: z.ZodLiteral<"transparent">;
    textColor: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
    shapeTextColor: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
    shapeStrokeColor: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
    shapeFillColor: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
    connectorColor: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
    noteBackgrounColor: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
    hightlighterColor: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
    Palettes: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }, {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }>, "many">;
    ShapeTextColorPalettes: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }, {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }>, "many">;
    NoteBackgroundColorMap: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodObject<{
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
    }>]>>;
    NoteBackgroundColorPalettes: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }, {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }>, "many">;
    StrokeColorShortMap: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodObject<{
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
    }>]>>;
    StrokeColorShortPalettes: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }, {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }>, "many">;
    FillColorShortMap: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodObject<{
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
    }>]>>;
    FillColorShortPalettes: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }, {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }>, "many">;
    ShapeTextColorShortMap: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodObject<{
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
    }>]>>;
    ShapeTextColorShortPalettes: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }, {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    transparent: "transparent";
    pureBlack: string;
    pureWhite: string;
    black: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    white: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    textColor: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    shapeTextColor: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    shapeStrokeColor: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    shapeFillColor: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    connectorColor: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    noteBackgrounColor: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    hightlighterColor: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    Palettes: {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }[];
    ShapeTextColorPalettes: {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }[];
    NoteBackgroundColorMap: Record<string, string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    }>;
    NoteBackgroundColorPalettes: {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }[];
    StrokeColorShortMap: Record<string, string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    }>;
    StrokeColorShortPalettes: {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }[];
    FillColorShortMap: Record<string, string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    }>;
    FillColorShortPalettes: {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }[];
    ShapeTextColorShortMap: Record<string, string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    }>;
    ShapeTextColorShortPalettes: {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }[];
}, {
    transparent: "transparent";
    pureBlack: string;
    pureWhite: string;
    black: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    white: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    textColor: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    shapeTextColor: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    shapeStrokeColor: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    shapeFillColor: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    connectorColor: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    noteBackgrounColor: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    hightlighterColor: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    Palettes: {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }[];
    ShapeTextColorPalettes: {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }[];
    NoteBackgroundColorMap: Record<string, string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    }>;
    NoteBackgroundColorPalettes: {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }[];
    StrokeColorShortMap: Record<string, string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    }>;
    StrokeColorShortPalettes: {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }[];
    FillColorShortMap: Record<string, string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    }>;
    FillColorShortPalettes: {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }[];
    ShapeTextColorShortMap: Record<string, string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    }>;
    ShapeTextColorShortPalettes: {
        key: string;
        value: string | {
            normal: string;
        } | {
            dark: string;
            light: string;
        };
    }[];
}>;
export type Theme = z.infer<typeof ThemeSchema>;
//# sourceMappingURL=types.d.ts.map