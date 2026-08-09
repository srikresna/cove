import { createIdentifier } from '@blocksuite/global/di';
import { StdIdentifier } from '@blocksuite/std';
import { Extension } from '@blocksuite/store';
import { DocModeProvider } from '../doc-mode-service';
import { TelemetryProvider } from '../telemetry-service/telemetry-service';
const CitationEventTypeMap = {
    Hover: 'AICitationHoverSource',
    Expand: 'AICitationExpandSource',
    Delete: 'AICitationDelete',
    Edit: 'AICitationEdit',
};
export const CitationProvider = createIdentifier('CitationService');
export class CitationService extends Extension {
    constructor(std) {
        super();
        this.std = std;
        this.isCitationModel = (model) => {
            return ('footnoteIdentifier' in model.props &&
                !!model.props.footnoteIdentifier &&
                'style' in model.props &&
                model.props.style === 'citation');
        };
    }
    static setup(di) {
        di.addImpl(CitationProvider, CitationService, [StdIdentifier]);
    }
    get docModeService() {
        return this.std.getOptional(DocModeProvider);
    }
    get telemetryService() {
        return this.std.getOptional(TelemetryProvider);
    }
    trackEvent(type, properties) {
        const editorMode = this.docModeService?.getEditorMode() ?? 'page';
        this.telemetryService?.track(CitationEventTypeMap[type], {
            page: editorMode === 'page' ? 'doc editor' : 'whiteboard editor',
            module: 'AI Result',
            control: 'Source',
            ...properties,
        });
    }
}
