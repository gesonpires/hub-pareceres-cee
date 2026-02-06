import fs from 'fs';

// pdf-parse não tem export default, precisa usar require
const pdfParse = require('pdf-parse');

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
