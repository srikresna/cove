import isMatch from "lodash.ismatch";
export function runQuery(query, block) {
  const blockViewType = getBlockViewType(query, block);
  block.blockViewType = blockViewType;
  if (blockViewType !== "hidden") {
    const queryMode = query.mode;
    setAncestorsToDisplayIfHidden(queryMode, block);
  }
}
function getBlockViewType(query, block) {
  const flavour = block.model.flavour;
  const id = block.model.id;
  const queryMode = query.mode;
  const props = block.model.keys.reduce((acc, key) => {
    return {
      ...acc,
      [key]: block.model.props[key],
    };
  }, {});
  let blockViewType = queryMode === "loose" ? "display" : "hidden";
  query.match.some((queryObject) => {
    const { id: queryId, flavour: queryFlavour, props: queryProps, viewType } = queryObject;
    const matchQueryId = queryId == null ? true : queryId === id;
    const matchQueryFlavour = queryFlavour == null ? true : queryFlavour === flavour;
    const matchQueryProps = queryProps == null ? true : isMatch(props, queryProps);
    if (matchQueryId && matchQueryFlavour && matchQueryProps) {
      blockViewType = viewType;
      return true;
    }
    return false;
  });
  return blockViewType;
}
function setAncestorsToDisplayIfHidden(mode, block) {
  const doc = block.model.store;
  let parent = doc.getParent(block.model);
  while (parent) {
    const parentBlock = doc.getBlock(parent.id);
    if (parentBlock && parentBlock.blockViewType === "hidden") {
      parentBlock.blockViewType = mode === "include" ? "display" : "bypass";
    }
    parent = doc.getParent(parent);
  }
}
