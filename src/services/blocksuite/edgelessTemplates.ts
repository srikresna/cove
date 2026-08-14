import { builtInTemplates as builtInEdgelessTemplates } from "@affine/templates/edgeless";
import { builtInTemplates as builtInStickerTemplates } from "@affine/templates/stickers";
import { EdgelessTemplatePanel } from "@blocksuite/affine/gfx/template";

const templateManagers = [builtInStickerTemplates, builtInEdgelessTemplates];

const coveTemplateManager: typeof EdgelessTemplatePanel.templates = {
  list: async (category) =>
    (await Promise.all(templateManagers.map(async (manager) => manager.list(category)))).flat(),
  categories: async () => [
    ...new Set(
      (await Promise.all(templateManagers.map(async (manager) => manager.categories()))).flat(),
    ),
  ],
  search: async (keyword, category) =>
    (
      await Promise.all(templateManagers.map(async (manager) => manager.search(keyword, category)))
    ).flat(),
  extend: () => undefined,
};

EdgelessTemplatePanel.templates = coveTemplateManager;

export function registerEdgelessTemplates(): void {
  const panel = customElements.get("edgeless-templates-panel") as
    | (CustomElementConstructor & { templates: typeof EdgelessTemplatePanel.templates })
    | undefined;
  if (panel) panel.templates = coveTemplateManager;
  EdgelessTemplatePanel.templates = coveTemplateManager;
}
