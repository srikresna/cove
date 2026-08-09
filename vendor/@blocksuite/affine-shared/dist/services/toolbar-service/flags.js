import { batch, signal } from '@preact/signals-core';
export var Flag;
(function (Flag) {
    Flag[Flag["None"] = 0] = "None";
    Flag[Flag["Surface"] = 1] = "Surface";
    Flag[Flag["Block"] = 2] = "Block";
    Flag[Flag["Text"] = 4] = "Text";
    Flag[Flag["Native"] = 8] = "Native";
    // Hovering something, e.g. inline links
    Flag[Flag["Hovering"] = 16] = "Hovering";
    // Dragging something or opening modal, e.g. drag handle, drag resources from outside, bookmark rename modal
    Flag[Flag["Hiding"] = 32] = "Hiding";
    // When the editor is inactive and the toolbar is hidden, we still want to accept the message
    Flag[Flag["Accepting"] = 64] = "Accepting";
})(Flag || (Flag = {}));
export class Flags {
    constructor() {
        this.value$ = signal(Flag.None);
    }
    get value() {
        return this.value$.peek();
    }
    toggle(flag, activated) {
        if (activated) {
            this.value$.value |= flag;
            return;
        }
        this.value$.value &= ~flag;
    }
    check(flag, value = this.value) {
        return (flag & value) === flag;
    }
    contains(flag, value = this.value) {
        return (flag & value) !== Flag.None;
    }
    refresh(flag) {
        batch(() => {
            this.toggle(flag, false);
            this.toggle(flag, true);
        });
    }
    reset() {
        this.value$.value = Flag.None;
    }
    hide() {
        batch(() => {
            this.toggle(Flag.Accepting, true);
            this.toggle(Flag.Hiding, true);
        });
    }
    show() {
        batch(() => {
            this.toggle(Flag.Hiding, false);
            this.toggle(Flag.Accepting, false);
        });
    }
    isSurface() {
        return this.check(Flag.Surface);
    }
    isText() {
        return this.check(Flag.Text);
    }
    isBlock() {
        return this.check(Flag.Block);
    }
    isNative() {
        return this.check(Flag.Native);
    }
    isHovering() {
        return this.check(Flag.Hovering);
    }
    accept() {
        return this.check(Flag.Accepting);
    }
}
