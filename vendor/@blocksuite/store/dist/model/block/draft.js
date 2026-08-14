const draftModelSymbol = Symbol("draftModel");
export function toDraftModel(origin) {
  const { id, version, flavour, role, keys, text, children } = origin;
  const props = origin.keys.reduce((acc, key) => {
    const target = origin.props;
    const value = target[key];
    return {
      ...acc,
      [key]: value,
    };
  }, {});
  return {
    id,
    version,
    flavour,
    role,
    keys,
    text,
    children: children.map(toDraftModel),
    props,
  };
}
