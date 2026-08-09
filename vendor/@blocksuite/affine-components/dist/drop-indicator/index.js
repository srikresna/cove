import { DropIndicator } from './drop-indicator';
export { FileDropConfigExtension, FileDropExtension, } from './file-drop-manager';
export { DropIndicator };
export function effects() {
    customElements.define('affine-drop-indicator', DropIndicator);
}
