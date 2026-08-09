export const uniMap = (component, map) => {
    return (ele, props, expose) => {
        const result = component(ele, map(props), expose);
        return {
            unmount: result.unmount,
            update: props => {
                result.update(map(props));
            },
        };
    };
};
