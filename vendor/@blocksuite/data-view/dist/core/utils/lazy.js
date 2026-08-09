export const lazy = (fn) => {
    let data;
    return {
        get value() {
            if (!data) {
                data = { value: fn() };
            }
            return data.value;
        },
    };
};
