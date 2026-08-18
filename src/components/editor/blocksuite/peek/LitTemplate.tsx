import { createComponent } from "@lit/react";
import { LitElement, type TemplateResult } from "lit";
import React, { createElement } from "react";

class LitTemplateWrapper extends LitElement {
  static override get properties() {
    return { template: { type: Object } };
  }
  declare template: TemplateResult | null;
  override createRenderRoot() {
    return this;
  }
  override render() {
    return this.template;
  }
}

if (!customElements.get("affine-lit-template-wrapper")) {
  customElements.define("affine-lit-template-wrapper", LitTemplateWrapper);
}

const TemplateWrapper = createComponent({
  tagName: "affine-lit-template-wrapper",
  elementClass: LitTemplateWrapper,
  react: React,
});

export function toReactNode(template: TemplateResult): React.ReactNode {
  return createElement(TemplateWrapper, { template });
}
