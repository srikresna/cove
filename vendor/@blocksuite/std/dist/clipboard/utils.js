export function onlyContainImgElement(ast) {
    if (ast.type === 'element') {
        switch (ast.tagName) {
            case 'html':
            case 'body':
                return ast.children.map(onlyContainImgElement).reduce((a, b) => {
                    if (a === 'no' || b === 'no') {
                        return 'no';
                    }
                    if (a === 'maybe' && b === 'maybe') {
                        return 'maybe';
                    }
                    return 'yes';
                }, 'maybe');
            case 'img':
                return 'yes';
            case 'head':
                return 'maybe';
            default:
                return 'no';
        }
    }
    return 'maybe';
}
