export class KanbanClipboardController {
    get readonly() {
        return this.logic.view.readonly$.value;
    }
    get host() {
        return this.logic.ui$.value;
    }
    constructor(logic) {
        this.logic = logic;
        this._onCopy = (_context, _kanbanSelection) => {
            // todo
            return true;
        };
        this._onPaste = (_context) => {
            // todo
            return true;
        };
    }
    hostConnected() {
        if (this.host) {
            this.host.disposables.add(this.logic.handleEvent('copy', ctx => {
                const kanbanSelection = this.logic.selectionController.selection;
                if (!kanbanSelection)
                    return false;
                this._onCopy(ctx, kanbanSelection);
                return true;
            }));
            this.host.disposables.add(this.logic.handleEvent('paste', ctx => {
                if (this.readonly)
                    return false;
                this._onPaste(ctx);
                return true;
            }));
        }
    }
}
