export const CODE_BLOCK_WRAP_KEY = 'codeBlockWrap';
export const codeBlockWrapMiddleware = (wrap) => {
    return ({ adapterConfigs }) => {
        adapterConfigs.set(CODE_BLOCK_WRAP_KEY, String(wrap));
    };
};
