/**
 * Ambient declaration for pdfmake's singleton entry. Cove aliases the `pdfmake`
 * specifier to AFFiNE/node_modules/pdfmake (same instance the BlockSuite PDF
 * adapter uses) so it can re-point pdfMake.fonts at local fonts before export.
 * Only the shape Cove touches is declared here.
 */
declare module "pdfmake/build/pdfmake" {
  interface PdfFontSlots {
    normal: string;
    bold: string;
    italics: string;
    bolditalics: string;
  }
  interface PdfMake {
    fonts: Record<string, PdfFontSlots>;
  }
  const pdfMake: PdfMake;
  export default pdfMake;
}
