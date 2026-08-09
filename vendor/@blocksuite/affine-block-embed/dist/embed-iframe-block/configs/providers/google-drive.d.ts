export declare const googleDriveConfig: {
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
export declare const GoogleDriveEmbedConfig: import("@blocksuite/store").ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<import("@blocksuite/affine-shared/services").EmbedIframeConfig>;
};
//# sourceMappingURL=google-drive.d.ts.map