import fs from 'fs';

// pdf-parse v2.4.5 exporta PDFParse como classe que precisa ser instanciada
const pdfModule = require('pdf-parse');
const PDFParse = pdfModule.PDFParse;

export async function extrairTextoPDF(caminhoArquivo: string): Promise<string> {
  try {
    const buffer = fs.readFileSync(caminhoArquivo);
    // pdf-parse v2.4.5 requer Uint8Array ao invés de Buffer
    const uint8Array = new Uint8Array(buffer);
    const parser = new PDFParse(uint8Array);
    await parser.load();
    const text = parser.getText();
    // Garantir que retornamos uma string
    if (typeof text === 'string') {
      return text;
    } else if (text && typeof text.toString === 'function') {
      return text.toString();
    } else {
      return String(text || '');
    }
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error);
    throw new Error('Erro ao extrair texto do arquivo PDF');
  }
}

export async function extrairTextoPDFBuffer(buffer: Buffer): Promise<string> {
  try {
    // pdf-parse v2.4.5 requer Uint8Array ao invés de Buffer
    const uint8Array = new Uint8Array(buffer);
    // Configurar opções para evitar warnings sobre standardFontDataUrl
    const parser = new PDFParse(uint8Array, {
      standardFontDataUrl: undefined // Usar fontes padrão
    });
    await parser.load();
    
    // Verificar o tipo de getText() e como extrair o texto corretamente
    let text: any = parser.getText();
    
    console.log('[PDF EXTRACTOR] Tipo de getText():', typeof text);
    console.log('[PDF EXTRACTOR] É função?', typeof text === 'function');
    console.log('[PDF EXTRACTOR] É Promise?', text && typeof text.then === 'function');
    console.log('[PDF EXTRACTOR] É objeto?', text && typeof text === 'object');
    if (text && typeof text === 'object') {
      console.log('[PDF EXTRACTOR] Chaves do objeto:', Object.keys(text));
    }
    
    // Se getText() for uma função, chamar ela
    if (typeof text === 'function') {
      text = text();
    }
    
    // Se retornar uma Promise, aguardar
    if (text && typeof text.then === 'function') {
      text = await text;
    }
    
    // Se for um objeto com propriedades, tentar extrair o texto
    if (text && typeof text === 'object' && !Array.isArray(text)) {
      // Tentar diferentes propriedades comuns
      if (text.text && typeof text.text === 'string') {
        text = text.text;
      } else if (text.content && typeof text.content === 'string') {
        text = text.content;
      } else if (text.value && typeof text.value === 'string') {
        text = text.value;
      } else if (text.toString && typeof text.toString === 'function') {
        // Tentar toString() mas verificar se não retorna [object Object]
        const str = text.toString();
        if (str !== '[object Object]') {
          text = str;
        } else {
          // Se toString() retorna [object Object], tentar acessar páginas
          console.log('[PDF EXTRACTOR] toString() retornou [object Object], tentando método alternativo...');
          try {
            // Tentar método alternativo: acessar diretamente as páginas
            const pages = parser.getPages();
            if (pages && Array.isArray(pages)) {
              text = pages.map((page: any) => {
                if (page && page.getText) {
                  const pageText = page.getText();
                  return typeof pageText === 'string' ? pageText : '';
                } else if (page && typeof page === 'string') {
                  return page;
                } else if (page && page.text) {
                  return page.text;
                }
                return '';
              }).join('\n');
            } else {
              // Último recurso: JSON.stringify
              text = JSON.stringify(text);
            }
          } catch (e) {
            console.error('[PDF EXTRACTOR] Erro ao tentar método alternativo:', e);
            text = JSON.stringify(text);
          }
        }
      } else {
        // Último recurso: JSON.stringify
        text = JSON.stringify(text);
      }
    }
    
    // Garantir que retornamos uma string válida
    if (typeof text === 'string') {
      // Verificar se não é a string "[object Object]"
      if (text === '[object Object]') {
        console.error('[PDF EXTRACTOR] getText() retornou [object Object]!');
        return '';
      }
      console.log('[PDF EXTRACTOR] Texto extraído (primeiros 100 chars):', text.substring(0, 100));
      return text;
    } else if (text && typeof text.toString === 'function') {
      const str = text.toString();
      if (str !== '[object Object]') {
        return str;
      }
    }
    
    // Último recurso
    console.error('[PDF EXTRACTOR] Não foi possível extrair texto válido');
    return String(text || '');
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error);
    throw new Error('Erro ao extrair texto do arquivo PDF');
  }
}
