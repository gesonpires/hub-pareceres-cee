import fs from 'fs';

// pdf-parse exporta como objeto, a função principal está em PDFParse
// Mas também pode exportar diretamente dependendo da versão
const pdfModule = require('pdf-parse');
const pdfParse = (typeof pdfModule === 'function') 
  ? pdfModule 
  : (pdfModule.PDFParse || pdfModule.default || pdfModule);

export async function extrairTextoPDF(caminhoArquivo: string): Promise<string> {
  try {
    const buffer = fs.readFileSync(caminhoArquivo);
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error);
    throw new Error('Erro ao extrair texto do arquivo PDF');
  }
}

export async function extrairTextoPDFBuffer(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error);
    throw new Error('Erro ao extrair texto do arquivo PDF');
  }
}
