const origDefine = customElements.define.bind(customElements);

customElements.define = ((name, ctor, options) => {
  if (customElements.get(name)) return;
  origDefine(name, ctor as CustomElementConstructor, options);
}) as typeof customElements.define;
