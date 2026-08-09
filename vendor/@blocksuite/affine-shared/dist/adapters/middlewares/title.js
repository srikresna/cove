export const titleMiddleware = (metas) => ({ slots, adapterConfigs }) => {
    const beforeExportSubscription = slots.beforeExport.subscribe(() => {
        for (const meta of metas) {
            adapterConfigs.set('title:' + meta.id, meta.title);
        }
    });
    return () => {
        beforeExportSubscription.unsubscribe();
    };
};
