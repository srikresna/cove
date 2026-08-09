import { expect } from '@playwright/test';
const defaultPlaygroundURL = new URL(`http://localhost:${process.env.CI ? 4173 : 5173}/`);
export async function type(page, content) {
    await page.keyboard.type(content, { delay: 50 });
}
export async function press(page, content) {
    await page.keyboard.press(content, { delay: 50 });
    await page.waitForTimeout(50);
}
export async function enterInlineEditorPlayground(page) {
    const url = new URL('examples/inline/index.html', defaultPlaygroundURL);
    await page.goto(url.toString());
}
export async function focusInlineRichText(page, index = 0) {
    await page.evaluate(index => {
        const richTexts = document
            .querySelector('test-page')
            ?.querySelectorAll('test-rich-text');
        if (!richTexts) {
            throw new Error('Cannot find test-rich-text');
        }
        richTexts[index].inlineEditor.focusEnd();
    }, index);
}
export async function getDeltaFromInlineRichText(page, index = 0) {
    await page.waitForTimeout(100);
    return page.evaluate(index => {
        const richTexts = document
            .querySelector('test-page')
            ?.querySelectorAll('test-rich-text');
        if (!richTexts) {
            throw new Error('Cannot find test-rich-text');
        }
        const editor = richTexts[index].inlineEditor;
        return editor.yText.toDelta();
    }, index);
}
export async function getInlineRangeFromInlineRichText(page, index = 0) {
    await page.waitForTimeout(100);
    return page.evaluate(index => {
        const richTexts = document
            .querySelector('test-page')
            ?.querySelectorAll('test-rich-text');
        if (!richTexts) {
            throw new Error('Cannot find test-rich-text');
        }
        const editor = richTexts[index].inlineEditor;
        return editor.getInlineRange();
    }, index);
}
export async function setInlineRichTextRange(page, inlineRange, index = 0) {
    await page.evaluate(([inlineRange, index]) => {
        const richTexts = document
            .querySelector('test-page')
            ?.querySelectorAll('test-rich-text');
        if (!richTexts) {
            throw new Error('Cannot find test-rich-text');
        }
        const editor = richTexts[index]
            .inlineEditor;
        editor.setInlineRange(inlineRange);
    }, [inlineRange, index]);
}
export async function getInlineRichTextLine(page, index, i = 0) {
    return page.evaluate(([index, i]) => {
        const richTexts = document.querySelectorAll('test-rich-text');
        if (!richTexts) {
            throw new Error('Cannot find test-rich-text');
        }
        const editor = richTexts[i].inlineEditor;
        const result = editor.getLine(index);
        if (!result) {
            throw new Error('Cannot find line');
        }
        const { line, rangeIndexRelatedToLine } = result;
        return [line.vTextContent, rangeIndexRelatedToLine];
    }, [index, i]);
}
export async function getInlineRangeIndexRect(page, [richTextIndex, inlineIndex], coordOffSet = { x: 0, y: 0 }) {
    const rect = await page.evaluate(({ richTextIndex, inlineIndex: vIndex, coordOffSet }) => {
        const richText = document.querySelectorAll('test-rich-text')[richTextIndex];
        const domRange = richText.inlineEditor.toDomRange({
            index: vIndex,
            length: 0,
        });
        const pointBound = domRange.getBoundingClientRect();
        return {
            x: pointBound.left + coordOffSet.x,
            y: pointBound.top + pointBound.height / 2 + coordOffSet.y,
        };
    }, {
        richTextIndex,
        inlineIndex,
        coordOffSet,
    });
    return rect;
}
export async function assertSelection(page, richTextIndex, rangeIndex, rangeLength = 0) {
    const actual = await page.evaluate(([richTextIndex]) => {
        const richText = document?.querySelectorAll('test-rich-text')[richTextIndex];
        // @ts-expect-error getInlineRange
        const inlineEditor = richText.inlineEditor;
        return inlineEditor?.getInlineRange();
    }, [richTextIndex]);
    expect(actual).toEqual({ index: rangeIndex, length: rangeLength });
}
