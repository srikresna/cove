export function getGroupTitle(elementModel) {
    let title = '';
    if (elementModel.type !== 'group') {
        return title;
    }
    if ('title' in elementModel &&
        typeof elementModel.title === 'object' &&
        elementModel.title) {
        let delta = [];
        if ('delta' in elementModel.title) {
            delta = elementModel.title.delta;
        }
        title = delta.map(d => d.insert).join('');
    }
    return title;
}
