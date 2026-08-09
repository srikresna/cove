import { z } from 'zod';
export const LinkPreviewDataSchema = z.object({
    description: z.string().nullable(),
    icon: z.string().nullable(),
    image: z.string().nullable(),
    title: z.string().nullable(),
});
