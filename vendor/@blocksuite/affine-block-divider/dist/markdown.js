import { DividerBlockSchema, ParagraphBlockModel, ParagraphBlockSchema, } from '@blocksuite/affine-model';
import { focusTextModel } from '@blocksuite/affine-rich-text';
import { matchModels } from '@blocksuite/affine-shared/utils';
import { InlineMarkdownExtension } from '@blocksuite/std/inline';
export const DividerMarkdownExtension = InlineMarkdownExtension({
    name: 'divider',
    pattern: /^(-{3,}|\*{3,}|_{3,})\s$/,
    action: ({ inlineEditor, inlineRange }) => {
        if (inlineEditor.yTextString.slice(0, inlineRange.index).includes('\n')) {
            return;
        }
        if (!inlineEditor.rootElement)
            return;
        const blockComponent = inlineEditor.rootElement.closest('[data-block-id]');
        if (!blockComponent)
            return;
        const { model, std, store } = blockComponent;
        if (matchModels(model, [ParagraphBlockModel]) &&
            model.props.type !== 'quote') {
            const parent = store.getParent(model);
            if (!parent)
                return;
            const index = parent.children.indexOf(model);
            store.captureSync();
            inlineEditor.deleteText({
                index: 0,
                length: inlineRange.index,
            });
            store.addBlock(DividerBlockSchema.model.flavour, {
                children: model.children,
            }, parent, index);
            const nextBlock = parent.children.at(index + 1);
            let id = nextBlock?.id;
            if (!id) {
                id = store.addBlock(ParagraphBlockSchema.model.flavour, {}, parent);
            }
            focusTextModel(std, id);
        }
    },
});
