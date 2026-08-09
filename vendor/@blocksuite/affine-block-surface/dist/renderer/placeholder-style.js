import {} from '@blocksuite/affine-model';
import { getAffinePlaceholderFillColor } from '@blocksuite/affine-shared/theme';
export function getSurfacePlaceholderFallback(colorScheme) {
    return getAffinePlaceholderFillColor(colorScheme);
}
export function resolveSurfacePlaceholderColor(colorScheme) {
    return getSurfacePlaceholderFallback(colorScheme);
}
