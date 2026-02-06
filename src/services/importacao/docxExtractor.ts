import mammoth from 'mammoth';

export async function extrairTextoDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error) {
    console.error('Erro ao extrair texto do DOCX:', error);
    throw new Error('Erro ao extrair texto do arquivo DOCX');
  }
}
