import { TextBackgroundDuotoneIcon } from '@blocksuite/icons/lit';
import { css, LitElement } from 'lit';
export class TextDuotoneIcon extends LitElement {
    static { this.styles = css `
    svg {
      display: flex;
      font-size: 20px;
    }
    svg > path:nth-child(1) {
      fill: var(--background, unset);
    }
    svg > path:nth-child(3) {
      fill: var(--color, unset);
    }
  `; }
    render() {
        return TextBackgroundDuotoneIcon();
    }
}
