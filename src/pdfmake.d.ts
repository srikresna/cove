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
