export const createInteractionContext = (event) => {
    let preventDefaultState = false;
    return {
        context: {
            event,
            raw: event.raw,
            preventDefault: () => {
                preventDefaultState = true;
                event.raw.preventDefault();
            },
        },
        get preventDefaultState() {
            return preventDefaultState;
        },
    };
};
