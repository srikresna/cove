import { createIdentifier } from "@blocksuite/global/di";
export const BlockSchemaIdentifier = createIdentifier("BlockSchema");
export function BlockSchemaExtension(blockSchema) {
  return {
    setup: (di) => {
      di.addImpl(BlockSchemaIdentifier(blockSchema.model.flavour), () => blockSchema);
    },
  };
}
