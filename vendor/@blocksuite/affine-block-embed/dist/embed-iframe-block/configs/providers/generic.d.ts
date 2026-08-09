export declare const genericConfig: {
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
        allow: string;
        referrerpolicy: string;
        sandbox: string;
    };
};
export declare const GenericEmbedConfig: import("@blocksuite/store").ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<import("@blocksuite/affine-shared/services").EmbedIframeConfig>;
};
//# sourceMappingURL=generic.d.ts.map