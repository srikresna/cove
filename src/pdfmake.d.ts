/**
 * Ambient declaration for pdfmake's singleton entry. Cove declares pdfmake as a
 * direct dependency and re-points pdfMake.fonts at local fonts before export.
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
