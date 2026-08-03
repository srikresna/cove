import { builtInTemplates as builtInEdgelessTemplates } from "@affine/templates/edgeless";
import { builtInTemplates as builtInStickerTemplates } from "@affine/templates/stickers";
import { EdgelessTemplatePanel } from "@blocksuite/affine/gfx/template";

/**
 * Cove's template catalogue: merges the built-in edgeless + sticker template
 * managers into the single registry BlockSuite's EdgelessTemplatePanel reads.
 * Applied once at module load and re-applied on demand via
 * {@link registerEdgelessTemplates} (the panel custom element is registered
 * lazily by BlockSuite, so the static assignment may run before it exists).
 */
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

/**
 * Re-applies Cove's template manager onto the edgeless-templates-panel custom
 * element if it has been registered since module load. Idempotent.
 */
export function registerEdgelessTemplates(): void {
  const panel = customElements.get("edgeless-templates-panel") as
    | (CustomElementConstructor & { templates: typeof EdgelessTemplatePanel.templates })
    | undefined;
  if (panel) panel.templates = coveTemplateManager;
  EdgelessTemplatePanel.templates = coveTemplateManager;
}
