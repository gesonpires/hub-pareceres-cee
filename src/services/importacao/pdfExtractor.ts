import pdf from 'pdf-parse';
import fs from 'fs';

export async function extrairTextoPDF(caminhoArquivo: string): Promise<string> {
  try {
    const buffer = fs.readFileSync(caminhoArquivo);
    const data = await pdf(buffer);
    return data.text || '';
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error);
    throw new Error('Erro ao extrair texto do arquivo PDF');
  }
}

export async function extrairTextoPDFBuffer(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text || '';
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error);
    throw new Error('Erro ao extrair texto do arquivo PDF');
  }
}
