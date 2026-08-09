import { type BlockStdScope, LifeCycleWatcher } from '@blocksuite/std';
import { type Signal } from '@preact/signals-core';
import { Subject } from 'rxjs';
import { z } from 'zod';
import { NodePropsSchema } from '../utils/index.js';
export type LastProps = z.infer<typeof NodePropsSchema>;
export type LastPropsKey = keyof LastProps;
declare const SessionPropsSchema: z.ZodObject<{
    templateCache: z.ZodString;
    remoteColor: z.ZodString;
    showBidirectional: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    templateCache: string;
    remoteColor: string;
    showBidirectional: boolean;
}, {
    templateCache: string;
    remoteColor: string;
    showBidirectional: boolean;
}>;
declare const LocalPropsSchema: z.ZodObject<{
    viewport: z.ZodUnion<[z.ZodObject<{
        centerX: z.ZodNumber;
        centerY: z.ZodNumber;
        zoom: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        centerX: number;
        centerY: number;
        zoom: number;
    }, {
        centerX: number;
        centerY: number;
        zoom: number;
    }>, z.ZodObject<{
        xywh: z.ZodString;
        padding: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
    }, "strip", z.ZodTypeAny, {
        xywh: string;
        padding?: [number, number, number, number] | undefined;
    }, {
        xywh: string;
        padding?: [number, number, number, number] | undefined;
    }>]>;
    presentBlackBackground: z.ZodBoolean;
    presentFillScreen: z.ZodBoolean;
    presentHideToolbar: z.ZodBoolean;
    presentNoFrameToastShown: z.ZodBoolean;
    autoHideEmbedHTMLFullScreenToolbar: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    viewport: {
        centerX: number;
        centerY: number;
        zoom: number;
    } | {
        xywh: string;
        padding?: [number, number, number, number] | undefined;
    };
    presentBlackBackground: boolean;
    presentFillScreen: boolean;
    presentHideToolbar: boolean;
    presentNoFrameToastShown: boolean;
    autoHideEmbedHTMLFullScreenToolbar: boolean;
}, {
    viewport: {
        centerX: number;
        centerY: number;
        zoom: number;
    } | {
        xywh: string;
        padding?: [number, number, number, number] | undefined;
    };
    presentBlackBackground: boolean;
    presentFillScreen: boolean;
    presentHideToolbar: boolean;
    presentNoFrameToastShown: boolean;
    autoHideEmbedHTMLFullScreenToolbar: boolean;
}>;
type SessionProps = z.infer<typeof SessionPropsSchema>;
type LocalProps = z.infer<typeof LocalPropsSchema>;
type StorageProps = SessionProps & LocalProps;
type StoragePropsKey = keyof StorageProps;
export declare class EditPropsStore extends LifeCycleWatcher {
    static key: string;
    private readonly _disposables;
    private readonly innerProps$;
    lastProps$: Signal<LastProps>;
    slots: {
        storageUpdated: Subject<{
            key: StoragePropsKey;
            value: StorageProps[StoragePropsKey];
        }>;
    };
    constructor(std: BlockStdScope);
    private _getStorage;
    private _getStorageKey;
    applyLastProps<K extends LastPropsKey>(key: K, props: Record<string, unknown>): {
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
    }[K] & Record<string, unknown>;
    dispose(): void;
    getStorage<T extends StoragePropsKey>(key: T): StorageProps[T] | null;
    recordLastProps(key: LastPropsKey, props: Partial<LastProps[LastPropsKey]>): void;
    setStorage<T extends StoragePropsKey>(key: T, value: StorageProps[T]): void;
    unmounted(): void;
}
export {};
//# sourceMappingURL=edit-props-store.d.ts.map