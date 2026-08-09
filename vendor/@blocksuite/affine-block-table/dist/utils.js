export const cleanSelection = () => {
    const selection = window.getSelection();
    if (selection) {
        selection.removeAllRanges();
    }
};
export const compareByOrder = (a, b) => (a.order === b.order ? 0 : a.order > b.order ? 1 : -1);
