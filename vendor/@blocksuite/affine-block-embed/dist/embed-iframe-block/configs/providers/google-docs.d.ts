export declare const googleDocsConfig: {
    name: string;
    match: (url: string) => boolean;
    buildOEmbedUrl: (url: string) => string | undefined;
    useOEmbedUrlDirectly: boolean;
    validateIframeUrl: (iframeUrl: string) => boolean;
    options: {
        widthInSurface: number;
        heightInSurface: number;
        widthPercent: number;
        heightInNote: number;
        allowFullscreen: boolean;
        style: string;
    };
};
export declare const GoogleDocsEmbedConfig: import("@blocksuite/store").ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<import("@blocksuite/affine-shared/services").EmbedIframeConfig>;
};
//# sourceMappingURL=google-docs.d.ts.map