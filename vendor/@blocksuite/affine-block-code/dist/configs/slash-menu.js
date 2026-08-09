import {} from '@blocksuite/affine-widget-slash-menu';
export const codeSlashMenuConfig = {
    disableWhen: ({ model }) => {
        return model.flavour === 'affine:code';
    },
    items: [],
};
