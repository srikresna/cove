import type { PointerEventState, UIEventState } from '../../event';
export type SupportedEvents = 'click' | 'dblclick' | 'pointerdown' | 'pointerenter' | 'pointerleave' | 'pointermove' | 'pointerup' | 'dragstart' | 'dragmove' | 'dragend';
export type GfxInteractivityContext<EventState extends UIEventState = PointerEventState, RawEvent extends Event = EventState['event']> = {
    event: EventState;
    /**
     * The raw dom event.
     */
    raw: RawEvent;
    /**
     * Prevent the default gfx interaction
     */
    preventDefault: () => void;
};
export declare const createInteractionContext: (event: PointerEventState) => {
    context: {
        event: PointerEventState;
        raw: PointerEvent;
        preventDefault: () => void;
    };
    readonly preventDefaultState: boolean;
};
//# sourceMappingURL=event.d.ts.map