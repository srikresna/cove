import { createContext } from '@lit/context';
export const ADAPTERS = [
    { id: 'markdown', label: 'Markdown' },
    { id: 'plaintext', label: 'PlainText' },
    { id: 'html', label: 'HTML' },
    { id: 'snapshot', label: 'Snapshot' },
];
export const adapterPanelContext = createContext('adapterPanelContext');
