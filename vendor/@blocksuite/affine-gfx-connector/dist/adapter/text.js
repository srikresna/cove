export function getConnectorText(elementModel) {
    let text = '';
    if (elementModel.type !== 'connector') {
        return text;
    }
    if ('text' in elementModel &&
        typeof elementModel.text === 'object' &&
        elementModel.text) {
        let delta = [];
        if ('delta' in elementModel.text) {
            delta = elementModel.text.delta;
        }
        text = delta.map(d => d.insert).join('');
    }
    return text;
}
