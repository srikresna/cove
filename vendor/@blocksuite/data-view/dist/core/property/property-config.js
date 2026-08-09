export const propertyType = (type) => ({
    type: type,
    modelConfig: (ops) => {
        const create = (name, data) => {
            return {
                type,
                name,
                data: data ?? ops.propertyData.default(),
            };
        };
        return {
            type,
            config: ops,
            create,
            createPropertyMeta: renderer => ({
                type,
                config: ops,
                create,
                renderer: {
                    type,
                    ...renderer,
                },
            }),
        };
    },
});
