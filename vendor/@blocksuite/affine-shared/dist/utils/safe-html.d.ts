import DOMPurify from 'dompurify';
type DOMPurifyOptions = NonNullable<Parameters<typeof DOMPurify.sanitize>[1]>;
type SanitizeOptions = Omit<DOMPurifyOptions, 'IN_PLACE' | 'RETURN_DOM' | 'RETURN_DOM_FRAGMENT' | 'RETURN_TRUSTED_TYPE'> & {
    IN_PLACE?: false | undefined;
    RETURN_DOM?: false | undefined;
    RETURN_DOM_FRAGMENT?: false | undefined;
    RETURN_TRUSTED_TYPE?: false | undefined;
};
export declare function sanitizeHTML(html: string, options?: SanitizeOptions): string;
export declare function unsafeHTML(html: string, options?: SanitizeOptions): import("lit-html/directive.js").DirectiveResult<typeof import("lit-html/directives/unsafe-html.js").UnsafeHTMLDirective>;
export {};
//# sourceMappingURL=safe-html.d.ts.map