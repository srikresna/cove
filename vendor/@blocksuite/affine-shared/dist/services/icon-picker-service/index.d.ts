import type { UniComponent } from '@blocksuite/affine-shared/types';
export declare enum IconType {
    Emoji = "emoji",
    AffineIcon = "affine-icon",
    Blob = "blob"
}
export type IconData = {
    type: IconType.Emoji;
    unicode: string;
} | {
    type: IconType.AffineIcon;
    name: string;
    color: string;
} | {
    type: IconType.Blob;
    blob: Blob;
};
export interface IconPickerService {
    iconPickerComponent: UniComponent<{
        onSelect?: (data?: IconData) => void;
    }>;
}
export declare const IconPickerServiceIdentifier: import("@blocksuite/global/di").ServiceIdentifier<IconPickerService> & (<U extends IconPickerService = IconPickerService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
//# sourceMappingURL=index.d.ts.map