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
    if (!textoExtraido || typeof textoExtraido !== 'string' || textoExtraido.trim().length === 0) {
      throw new Error('Não foi possível extrair texto do arquivo. O arquivo pode estar corrompido ou ser uma imagem escaneada.');
    }

    // Parsear texto para sugerir dados
    let dadosSugeridos = parsearParecer(textoExtraido);
    
    // Se não encontrou número/ano no texto, tentar extrair do nome do arquivo
    // Padrão: CEE_SC_XXX_YYYY
    if (!dadosSugeridos.numeroParecer || !dadosSugeridos.anoParecer) {
      const nomeMatch = nomeArquivo.match(/cee[_\s\/]*sc[_\s]*(\d+)[_\s]*(\d{4})/i);
      if (nomeMatch) {
        const numero = parseInt(nomeMatch[1]);
        const ano = parseInt(nomeMatch[2]);
        if (numero > 0 && ano >= 2000 && ano <= 2100) {
          dadosSugeridos.numeroParecer = numero;
          dadosSugeridos.anoParecer = ano;
        }
      }
    }
    
    // Tentar extrair nome da escola do nome do arquivo se não encontrou no texto
    // Padrão comum: ..._NomeEscola_Cidade.pdf
    if (!dadosSugeridos.escolaNome) {
      // Remover extensão e padrão CEE_SC_XXX_YYYY do início
      const nomeLimpo = nomeArquivo
        .replace(/\.(pdf|docx?)$/i, '')
        .replace(/^parecer\s*cee[_\s\/]*sc[_\s]*\d+[_\s]*\d{4}[_\s]*/i, '')
        .replace(/^cee[_\s\/]*sc[_\s]*\d+[_\s]*\d{4}[_\s]*/i, '');
      
      // Tentar extrair nome da escola (geralmente antes da última parte que é a cidade)
      const partes = nomeLimpo.split(/[_\s]+/);
      if (partes.length >= 2) {
        // Pegar todas as partes exceto a última (que geralmente é a cidade)
        const possivelEscola = partes.slice(0, -1).join(' ');
        if (possivelEscola.length > 5 && possivelEscola.length < 200) {
          dadosSugeridos.escolaNome = possivelEscola;
        }
      } else if (partes.length === 1 && partes[0].length > 5) {
        dadosSugeridos.escolaNome = partes[0];
      }
    }

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
