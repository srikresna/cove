import { type Container } from '@blocksuite/global/di';
import { type BlockStdScope } from '@blocksuite/std';
import { type BlockModel, Extension } from '@blocksuite/store';
import { DocModeProvider } from '../doc-mode-service';
import type { CitationEvents, CitationEventType } from '../telemetry-service/citation';
declare const CitationEventTypeMap: {
    readonly Hover: "AICitationHoverSource";
    readonly Expand: "AICitationExpandSource";
    readonly Delete: "AICitationDelete";
    readonly Edit: "AICitationEdit";
};
type EventType = keyof typeof CitationEventTypeMap;
type EventTypeMapping = {
    [K in EventType]: CitationEventType;
};
export interface CitationViewService {
    /**
     * Tracks citation-related events
     * @param type - The type of citation event to track
     * @param properties - The properties of the event
     */
    trackEvent<T extends EventType>(type: T, properties?: CitationEvents[EventTypeMapping[T]]): void;
    /**
     * Checks if the model is a citation model
     * @param model - The model to check
     * @returns True if the model is a citation model, false otherwise
     */
    isCitationModel(model: BlockModel): boolean;
}
export declare const CitationProvider: import("@blocksuite/global/di").ServiceIdentifier<CitationViewService> & (<U extends CitationViewService = CitationViewService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare class CitationService extends Extension implements CitationViewService {
    private readonly std;
    constructor(std: BlockStdScope);
    static setup(di: Container): void;
    get docModeService(): DocModeProvider | null;
    get telemetryService(): import("..").TelemetryService | null;
    isCitationModel: (model: BlockModel) => boolean;
    trackEvent<T extends EventType>(type: T, properties?: CitationEvents[EventTypeMapping[T]]): void;
}
export {};
//# sourceMappingURL=citation-service.d.ts.map