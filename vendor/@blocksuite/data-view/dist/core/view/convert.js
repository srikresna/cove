export const createViewConvert = (from, to, convert) => {
    return {
        from: from.type,
        to: to.type,
        convert,
    };
};
