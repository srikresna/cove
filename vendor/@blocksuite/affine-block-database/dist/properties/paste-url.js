import { splitTextByUrl, } from '@blocksuite/affine-shared/utils';
export function analyzeTextForUrlPaste(text) {
    const segments = splitTextByUrl(text);
    const firstSegment = segments[0];
    const singleUrl = segments.length === 1 && firstSegment?.link && firstSegment.text === text
        ? firstSegment.link
        : undefined;
    return {
        segments,
        singleUrl,
    };
}
export function insertUrlTextSegments(inlineEditor, inlineRange, segments) {
    let index = inlineRange.index;
    let replacedSelection = false;
    segments.forEach(segment => {
        if (!segment.text)
            return;
        const attributes = segment.link
            ? { link: segment.link }
            : undefined;
        inlineEditor.insertText({
            index,
            length: replacedSelection ? 0 : inlineRange.length,
        }, segment.text, attributes);
        replacedSelection = true;
        index += segment.text.length;
    });
    inlineEditor.setInlineRange({
        index,
        length: 0,
    });
}
