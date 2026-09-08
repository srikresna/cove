declare module "pdfmake/build/pdfmake" {
  interface PdfFontSlots {
    normal: string;
    bold: string;
    italics: string;
    bolditalics: string;
  }
  interface PdfMake {
    fonts: Record<string, PdfFontSlots>;
    /** 0.3 API: feeds font files (base64, keyed by file name) into the
     *  module-level VirtualFileSystem that font names resolve against. */
    addVirtualFileSystem(vfs: Record<string, string>): void;
  }
  const pdfMake: PdfMake;
  export default pdfMake;
}
