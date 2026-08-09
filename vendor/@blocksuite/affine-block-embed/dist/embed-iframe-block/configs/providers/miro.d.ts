export declare const miroConfig: {
    name: string;
    match: (url: string) => boolean;
    buildOEmbedUrl: (url: string) => string | undefined;
    useOEmbedUrlDirectly: boolean;
    validateIframeUrl: (iframeUrl: string) => boolean;
    options: {
        widthInSurface: number;
        heightInSurface: number;
        heightInNote: number;
        widthPercent: number;
        allow: string;
        style: string;
        allowFullscreen: boolean;
        containerBorderRadius: number;
    };
};
export declare const MiroEmbedConfig: import("@blocksuite/store").ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<import("@blocksuite/affine-shared/services").EmbedIframeConfig>;
};
//# sourceMappingURL=miro.d.ts.map