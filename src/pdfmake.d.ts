declare module "pdfmake/build/pdfmake" {
  interface PdfFontSlots {
    normal: string;
    bold: string;
    italics: string;
    bolditalics: string;
  }
  interface PdfMake {
    fonts: Record<string, PdfFontSlots>;
    /** Virtual file system: font files as base64, keyed by file name. */
    vfs: Record<string, string>;
  }
  const pdfMake: PdfMake;
  export default pdfMake;
}
