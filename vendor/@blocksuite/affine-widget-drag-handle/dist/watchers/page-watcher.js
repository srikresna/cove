import { PageViewportService } from '@blocksuite/affine-shared/services';
export class PageWatcher {
    get pageViewportService() {
        return this.widget.std.get(PageViewportService);
    }
    constructor(widget) {
        this.widget = widget;
    }
    watch() {
        const { disposables } = this.widget;
        disposables.add(this.pageViewportService.subscribe(() => {
            this.widget.hide();
        }));
    }
}
