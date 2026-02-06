import { extrairTextoPDFBuffer } from './pdfExtractor';
import { extrairTextoDOCX } from './docxExtractor';
import { parsearParecer } from './parecerParser';

export interface ArquivoProcessado {
  nomeArquivo: string;
  tipo: 'pdf' | 'docx' | 'doc' | 'unknown';
  textoExtraido: string;
  dadosSugeridos: ReturnType<typeof parsearParecer>;
  erro?: string;
}

/**
 * Processa um arquivo e extrai texto + sugestões de dados
 */
export async function processarArquivo(
  buffer: Buffer,
  nomeArquivo: string
): Promise<ArquivoProcessado> {
  const extensao = nomeArquivo.toLowerCase().split('.').pop() || '';
  
  let textoExtraido = '';
  let tipo: 'pdf' | 'docx' | 'doc' | 'unknown' = 'unknown';

  try {
    switch (extensao) {
      case 'pdf':
        tipo = 'pdf';
        textoExtraido = await extrairTextoPDFBuffer(buffer);
        break;
      
      case 'docx':
        tipo = 'docx';
        textoExtraido = await extrairTextoDOCX(buffer);
        break;
      
      case 'doc':
        tipo = 'doc';
        // DOC antigo não é suportado diretamente
        // Sugerir conversão para DOCX ou usar ferramenta externa
        throw new Error('Arquivos .doc (formato antigo) não são suportados diretamente. Por favor, converta para .docx ou .pdf primeiro.');
      
      default:
        throw new Error(`Formato de arquivo não suportado: ${extensao}`);
    }

    // Garantir que textoExtraido é uma string antes de chamar trim()
    // Se for Promise, aguardar (não deveria acontecer)
    if (textoExtraido && typeof textoExtraido.then === 'function') {
      textoExtraido = await textoExtraido;
    }
    
    // Garantir que é string
    if (typeof textoExtraido !== 'string') {
      textoExtraido = String(textoExtraido || '');
    }
    
    if (!textoExtraido || textoExtraido.trim().length === 0) {
      throw new Error('Não foi possível extrair texto do arquivo. O arquivo pode estar corrompido ou ser uma imagem escaneada.');
    }

    // Parsear apenas para extrair número/ano do nome do arquivo
    const dadosSugeridos = parsearParecer(textoExtraido, nomeArquivo);

    return {
      nomeArquivo,
      tipo,
      textoExtraido,
      dadosSugeridos
    };
  } catch (error: any) {
    return {
      nomeArquivo,
      tipo,
      textoExtraido: '',
      dadosSugeridos: {
        textoCompleto: ''
      },
      erro: error.message || 'Erro desconhecido ao processar arquivo'
    };
  }
}
