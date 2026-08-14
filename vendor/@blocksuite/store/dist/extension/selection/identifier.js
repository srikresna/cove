import { createIdentifier } from "@blocksuite/global/di";
export const SelectionIdentifier = createIdentifier("Selection");
export function SelectionExtension(selectionCtor) {
  return {
    setup: (di) => {
      di.addImpl(SelectionIdentifier(selectionCtor.type), () => selectionCtor);
    },
  };
}
