import { getSelectedModelsCommand } from '@blocksuite/affine-shared/commands';
import {} from '@blocksuite/affine-widget-slash-menu';
import { ImageIcon } from '@blocksuite/icons/lit';
import { insertImagesCommand } from '../commands';
import { PhotoTooltip } from './tooltips';
export const imageSlashMenuConfig = {
    items: [
        {
            name: 'Image',
            description: 'Insert an image.',
            icon: ImageIcon(),
            tooltip: {
                figure: PhotoTooltip,
                caption: 'Photo',
            },
            group: '4_Content & Media@1',
            when: ({ model }) => model.store.schema.flavourSchemaMap.has('affine:image'),
            action: ({ std }) => {
                const [success, ctx] = std.command
                    .chain()
                    .pipe(getSelectedModelsCommand)
                    .pipe(insertImagesCommand, { removeEmptyLine: true })
                    .run();
                if (success)
                    ctx.insertedImageIds.catch(console.error);
            },
        },
    ],
};
