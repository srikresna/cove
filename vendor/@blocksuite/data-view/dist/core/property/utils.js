export const fromJson = (config, { value, data, dataSource, }) => {
    const fromJson = config.rawValue.fromJson;
    const jsonSchema = config.jsonValue.schema;
    if (!fromJson || !jsonSchema) {
        return;
    }
    const jsonResult = jsonSchema.safeParse(value);
    if (!jsonResult.success) {
        return;
    }
    return fromJson({
        value: jsonResult.data,
        data,
        dataSource,
    });
};
