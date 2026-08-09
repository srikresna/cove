import { ActionPlacement, type ToolbarContext } from '@blocksuite/affine-shared/services';
export declare const builtinMiscToolbarConfig: {
    readonly actions: [{
        readonly placement: ActionPlacement.Start;
        readonly id: "a.release-from-group";
        readonly tooltip: "Release from group";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly when: (ctx: ToolbarContext) => boolean;
        readonly run: (ctx: ToolbarContext) => void;
    }, {
        readonly placement: ActionPlacement.Start;
        readonly id: "b.add-frame";
        readonly label: "Frame";
        readonly showLabel: true;
        readonly tooltip: "Frame";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly when: (ctx: ToolbarContext) => boolean;
        readonly run: (ctx: ToolbarContext) => void;
    }, {
        readonly placement: ActionPlacement.Start;
        readonly id: "c.add-group";
        readonly label: "Group";
        readonly showLabel: true;
        readonly tooltip: "Group";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly when: (ctx: ToolbarContext) => boolean;
        readonly run: (ctx: ToolbarContext) => void;
    }, {
        readonly placement: ActionPlacement.Start;
        readonly id: "d.alignment";
        readonly when: (ctx: ToolbarContext) => boolean;
        readonly content: (ctx: ToolbarContext) => import("lit-html").TemplateResult<1> | null;
    }, {
        placement: ActionPlacement.End;
        id: string;
        label: string;
        tooltip: string;
        icon: import("lit-html").TemplateResult<1>;
        when(ctx: ToolbarContext): boolean;
        content(ctx: ToolbarContext): import("lit-html").TemplateResult<1> | null;
    }, {
        readonly placement: ActionPlacement.End;
        readonly id: "b.lock";
        readonly tooltip: "Lock";
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly run: (ctx: ToolbarContext) => void;
    }, {
        readonly content?: ((cx: ToolbarContext) => import("lit-html").TemplateResult | null) | (import("lit-html").TemplateResult | null);
        readonly label?: string;
        readonly score?: number;
        readonly when?: ((cx: ToolbarContext) => boolean) | boolean;
        readonly active?: ((cx: ToolbarContext) => boolean) | boolean;
        placement: ActionPlacement;
        readonly showLabel?: boolean;
        readonly icon?: import("lit-html").TemplateResult;
        readonly tooltip?: string | import("lit-html").TemplateResult;
        readonly variant?: "destructive";
        readonly disabled?: ((cx: ToolbarContext) => boolean) | boolean;
        readonly run?: (cx: ToolbarContext) => void;
        readonly id: "c.comment";
    }, ...({
        placement: ActionPlacement;
        id: "Z.a.selection";
        actions: [{
            readonly id: "a.create-frame";
            readonly label: "Frame section";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly run: (ctx: ToolbarContext) => void;
        }, {
            readonly id: "b.create-group";
            readonly label: "Group section";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly when: (ctx: ToolbarContext) => boolean;
            readonly run: (ctx: ToolbarContext) => void;
        }];
    } | {
        placement: ActionPlacement;
        id: "Z.b.reordering";
        actions: [{
            readonly id: "a.bring-to-front";
            readonly label: "Bring to Front";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly run: (ctx: ToolbarContext) => void;
        }, {
            readonly id: "b.bring-forward";
            readonly label: "Bring Forward";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly run: (ctx: ToolbarContext) => void;
        }, {
            readonly id: "c.send-backward";
            readonly label: "Send Backward";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly run: (ctx: ToolbarContext) => void;
        }, {
            readonly id: "c.send-to-back";
            readonly label: "Send to Back";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly run: (ctx: ToolbarContext) => void;
        }];
    } | {
        placement: ActionPlacement;
        id: "a.clipboard";
        actions: [{
            readonly id: "copy";
            readonly label: "Copy";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly run: (ctx: ToolbarContext) => void;
        }, {
            readonly id: "duplicate";
            readonly label: "Duplicate";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly run: (ctx: ToolbarContext) => void;
        }, {
            readonly id: "reload";
            readonly label: "Reload";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly when: (ctx: ToolbarContext) => boolean;
            readonly run: (ctx: ToolbarContext) => void;
        }];
    } | {
        placement: ActionPlacement;
        id: "d.conversions";
        actions: [{
            readonly id: "a.turn-into-linked-doc";
            readonly label: "Turn into linked doc";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly when: (ctx: ToolbarContext) => boolean;
            readonly run: (ctx: ToolbarContext) => void;
        }, {
            readonly id: "b.create-linked-doc";
            readonly label: "Create linked doc";
            readonly icon: import("lit-html").TemplateResult<1>;
            readonly when: (ctx: ToolbarContext) => boolean;
            readonly run: (ctx: ToolbarContext) => void;
        }];
    } | {
        placement: ActionPlacement;
        id: "e.delete";
        label: "Delete";
        icon: import("lit-html").TemplateResult<1>;
        variant: "destructive";
        run: (ctx: ToolbarContext) => void;
    })[]];
    readonly when: (ctx: ToolbarContext) => boolean;
};
export declare const builtinLockedToolbarConfig: {
    readonly actions: [{
        readonly placement: ActionPlacement.End;
        readonly id: "b.unlock";
        readonly label: "Click to unlock";
        readonly showLabel: true;
        readonly icon: import("lit-html").TemplateResult<1>;
        readonly run: (ctx: ToolbarContext) => void;
    }];
    readonly when: (ctx: ToolbarContext) => boolean;
};
//# sourceMappingURL=misc.d.ts.map