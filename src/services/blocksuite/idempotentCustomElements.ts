// The vendored effects modules register their custom elements via bare
// customElements.define at import time. Vite HMR re-evaluates those modules
// after edits, and a second define of the same name throws NotSupportedError
// ("affine-editor-container has already been used"), killing the boot with a
// blank screen. Making define idempotent app-wide absorbs re-registration:
// the first registration wins until a full reload, which is how custom
// elements behave under HMR anyway. Production builds load each module once,
// so the guard never triggers there.

const origDefine = customElements.define.bind(customElements);

customElements.define = ((name, ctor, options) => {
  if (customElements.get(name)) return;
  origDefine(name, ctor as CustomElementConstructor, options);
}) as typeof customElements.define;
