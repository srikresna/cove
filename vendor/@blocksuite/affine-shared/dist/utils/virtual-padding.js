import { autoUpdate } from '@floating-ui/dom';
import { signal } from '@preact/signals-core';
import { DocModeProvider } from '../services/doc-mode-service';
export class VirtualPaddingController {
    constructor(block) {
        this.block = block;
        this.virtualPadding$ = signal(0);
        block.addController(this);
    }
    get std() {
        return this.host.std;
    }
    get host() {
        return this.block.host;
    }
    hostConnected() {
        if (this.std.get(DocModeProvider).getEditorMode() === 'edgeless') {
            return;
        }
        this.block.disposables.add(autoUpdate(this.host, this.block, () => {
            const padding = this.block.getBoundingClientRect().left -
                this.host.getBoundingClientRect().left;
            this.virtualPadding$.value = Math.max(0, padding - 72);
        }));
    }
}
