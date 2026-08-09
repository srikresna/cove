export declare const bilibiliConfig: {
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
        sandbox: string;
        style: string;
        allowFullscreen: boolean;
    };
};
export declare const BilibiliEmbedConfig: import("@blocksuite/store").ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<import("@blocksuite/affine-shared/services").EmbedIframeConfig>;
};
//# sourceMappingURL=bilibili.d.ts.map