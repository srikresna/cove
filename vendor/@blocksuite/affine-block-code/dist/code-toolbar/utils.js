export const duplicateCodeBlock = (model) => {
    const keys = model.keys;
    const values = keys.map(key => model.props[key]);
    const blockProps = Object.fromEntries(keys.map((key, i) => [key, values[i]]));
    const { text: _text, ...duplicateProps } = blockProps;
    const newProps = {
        flavour: model.flavour,
        text: model.props.text.clone(),
        ...duplicateProps,
    };
    return model.store.addSiblingBlocks(model, [newProps])[0];
};
