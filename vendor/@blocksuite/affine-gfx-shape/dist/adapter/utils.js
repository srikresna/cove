export function getShapeType(elementModel) {
    let shapeType = '';
    if (elementModel.type !== 'shape') {
        return shapeType;
    }
    if ('shapeType' in elementModel &&
        typeof elementModel.shapeType === 'string') {
        shapeType = elementModel.shapeType;
    }
    return shapeType;
}
export function getShapeText(elementModel) {
    let text = '';
    if (elementModel.type !== 'shape') {
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
