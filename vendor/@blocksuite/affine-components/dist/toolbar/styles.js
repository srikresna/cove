import { combinedDarkCssVariables, combinedLightCssVariables, } from '@toeverything/theme';
import { unsafeCSS } from 'lit';
const toolbarColorKeys = [
    '--affine-background-overlay-panel-color',
    '--affine-v2-layer-background-overlayPanel',
    '--affine-v2-layer-insideBorder-blackBorder',
    '--affine-v2-icon-primary',
    '--affine-background-error-color',
    '--affine-background-primary-color',
    '--affine-background-tertiary-color',
    '--affine-icon-color',
    '--affine-icon-secondary',
    '--affine-border-color',
    '--affine-divider-color',
    '--affine-text-primary-color',
    '--affine-hover-color',
    '--affine-hover-color-filled',
];
export const lightToolbarStyles = (selector) => `
  ${selector}[data-app-theme='light'] {
    ${toolbarColorKeys
    .map(key => `${key}: ${unsafeCSS(combinedLightCssVariables[key])};`)
    .join('\n')}
  }
`;
export const darkToolbarStyles = (selector) => `
  ${selector}[data-app-theme='dark'] {
    ${toolbarColorKeys
    .map(key => `${key}: ${unsafeCSS(combinedDarkCssVariables[key])};`)
    .join('\n')}
  }
`;
