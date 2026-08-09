import { baseTheme } from '@toeverything/theme';
import { css, unsafeCSS } from 'lit';
export const fontBaseStyle = (container) => css `
  ${unsafeCSS(container)} {
    font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
    font-feature-settings:
      'clig' off,
      'liga' off;
    font-style: normal;
  }
`;
export const fontSMStyle = (container) => css `
  ${fontBaseStyle(container)}
  ${unsafeCSS(container)} {
    font-size: var(--affine-font-sm);
    font-weight: 500;
    line-height: 22px;
  }
`;
export const fontXSStyle = (container) => css `
  ${fontBaseStyle(container)}
  ${unsafeCSS(container)} {
    font-size: var(--affine-font-xs);
    font-weight: 500;
    line-height: 20px;
  }
`;
