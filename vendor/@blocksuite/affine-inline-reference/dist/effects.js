import { AffineReference, ReferencePopup } from './reference-node';
export function effects() {
    customElements.define('reference-popup', ReferencePopup);
    customElements.define('affine-reference', AffineReference);
}
