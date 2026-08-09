export const getRefType = (vars, ref) => {
    return vars.find(v => v.id === ref.name)?.type;
};
