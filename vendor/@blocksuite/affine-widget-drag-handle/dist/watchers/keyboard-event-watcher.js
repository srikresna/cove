export class KeyboardEventWatcher {
    constructor(widget) {
        this.widget = widget;
        this._keyboardHandler = ctx => {
            if (!this.widget.dragging) {
                return;
            }
            const state = ctx.get('defaultState');
            const event = state.event;
            event.preventDefault();
            event.stopPropagation();
        };
    }
    watch() {
        this.widget.handleEvent('beforeInput', () => this.widget.hide());
        this.widget.handleEvent('keyDown', this._keyboardHandler, { global: true });
        this.widget.handleEvent('keyUp', this._keyboardHandler, { global: true });
    }
}
