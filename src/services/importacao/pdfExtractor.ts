import fs from 'fs';

// pdf-parse v2.4.5 exporta PDFParse como classe que precisa ser instanciada
const pdfModule = require('pdf-parse');
const PDFParse = pdfModule.PDFParse;

export async function extrairTextoPDF(caminhoArquivo: string): Promise<string> {
  try {
    const buffer = fs.readFileSync(caminhoArquivo);
    const parser = new PDFParse(buffer);
    await parser.load();
    const text = parser.getText();
    return text || '';
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error);
    throw new Error('Erro ao extrair texto do arquivo PDF');
  }
}

export async function extrairTextoPDFBuffer(buffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse(buffer);
    await parser.load();
    const text = parser.getText();
    return text || '';
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error);
    throw new Error('Erro ao extrair texto do arquivo PDF');
  }
}
