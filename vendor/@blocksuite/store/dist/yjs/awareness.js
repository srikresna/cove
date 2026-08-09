export class AwarenessStore {
    constructor(awareness) {
        this.awareness = awareness;
        this.awareness.setLocalStateField('selectionV2', {});
    }
    destroy() {
        this.awareness.destroy();
    }
    getLocalSelection(selectionManagerId) {
        return ((this.awareness.getLocalState()?.selectionV2 ?? {})[selectionManagerId] ??
            []);
    }
    getStates() {
        return this.awareness.getStates();
    }
    getLocalState() {
        return this.awareness.getLocalState();
    }
    setLocalState(state) {
        this.awareness.setLocalState(state);
    }
    setLocalStateField(field, value) {
        this.awareness.setLocalStateField(field, value);
    }
    setLocalSelection(selectionManagerId, selection) {
        const oldSelection = this.awareness.getLocalState()?.selectionV2 ?? {};
        this.awareness.setLocalStateField('selectionV2', {
            ...oldSelection,
            [selectionManagerId]: selection,
        });
    }
}
