import DOMPurify from 'dompurify';
import { unsafeHTML as unsafeLitHtml } from 'lit/directives/unsafe-html.js';
export function sanitizeHTML(html, options) {
    return DOMPurify.sanitize(html, options);
}
export function unsafeHTML(html, options) {
    return unsafeLitHtml(sanitizeHTML(html, options));
}
