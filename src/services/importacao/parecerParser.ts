interface DadosParecerSugeridos {
  numeroParecer?: number;
  anoParecer?: number;
  dataParecer?: string;
  ementa?: string;
  escolaNome?: string;
  textoCompleto: string;
}

/**
 * Tenta extrair informações de um parecer a partir do texto extraído.
 * Como os formatos não são consistentes, esta função faz tentativas com regex flexíveis.
 */
export function parsearParecer(texto: string): DadosParecerSugeridos {
  const dados: DadosParecerSugeridos = {
    textoCompleto: texto
  };

  // Normalizar texto: remover múltiplos espaços e quebras de linha excessivas
  const textoNormalizado = texto.replace(/\s+/g, ' ').trim();

  // Tentar extrair número e ano do parecer
  // Padrões: "Parecer Nº 123/2024", "Parecer nº 123/2024", "Parecer 123/2024", etc.
  const parecerMatch = textoNormalizado.match(
    /parecer\s*(?:n[º°]|nº|n[°]|n\.?\s*)?\s*(\d+)\s*\/\s*(\d{4})/i
  );
  if (parecerMatch) {
    dados.numeroParecer = parseInt(parecerMatch[1]);
    dados.anoParecer = parseInt(parecerMatch[2]);
  } else {
    // Tentar padrão alternativo: "Parecer 123 de 2024"
    const parecerAltMatch = textoNormalizado.match(
      /parecer\s*(?:n[º°]|nº|n[°]|n\.?\s*)?\s*(\d+)\s+(?:de\s+)?(\d{4})/i
    );
    if (parecerAltMatch) {
      dados.numeroParecer = parseInt(parecerAltMatch[1]);
      dados.anoParecer = parseInt(parecerAltMatch[2]);
    }
  }

  // Tentar extrair data do parecer
  // Padrões: "Data: 15/03/2024", "15/03/2024", etc.
  const dataPatterns = [
    /(?:data|data\s+do\s+parecer)[\s:]*(\d{2})\/(\d{2})\/(\d{4})/i,
    /(\d{2})\/(\d{2})\/(\d{4})/g
  ];

  for (const pattern of dataPatterns) {
    const matches = textoNormalizado.match(pattern);
    if (matches) {
      // Pegar a primeira data encontrada que parece ser uma data válida
      const match = matches[0].match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (match) {
        const dia = parseInt(match[1]);
        const mes = parseInt(match[2]);
        const ano = parseInt(match[3]);
        
        // Validar se é uma data razoável (ano entre 2000 e 2100)
        if (ano >= 2000 && ano <= 2100 && mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31) {
          dados.dataParecer = `${ano}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
          break;
        }
      }
    }
  }

  // Tentar extrair ementa
  // Padrões: "Ementa:", "E M E N T A", etc.
  const ementaPatterns = [
    /(?:ementa|e\s*m\s*e\s*n\s*t\s*a)[\s:]*([^\n]{50,500})/i,
    /(?:resumo|objeto)[\s:]*([^\n]{50,500})/i
  ];

  for (const pattern of ementaPatterns) {
    const match = textoNormalizado.match(pattern);
    if (match && match[1]) {
      // Pegar até 500 caracteres após "Ementa:"
      let ementa = match[1].trim();
      // Limitar tamanho e remover quebras de linha excessivas
      if (ementa.length > 500) {
        ementa = ementa.substring(0, 500) + '...';
      }
      dados.ementa = ementa.replace(/\s+/g, ' ').trim();
      break;
    }
  }

  // Tentar extrair nome da escola
  // Padrões: "Escola:", "Instituição:", "Estabelecimento:", etc.
  const escolaPatterns = [
    /(?:escola|institui[çc][ãa]o|estabelecimento)[\s:]*([^\n]{10,200})/i,
    /(?:denomina[çc][ãa]o)[\s:]*([^\n]{10,200})/i
  ];

  for (const pattern of escolaPatterns) {
    const match = textoNormalizado.match(pattern);
    if (match && match[1]) {
      let escolaNome = match[1].trim();
      // Pegar até o primeiro ponto, vírgula ou quebra de linha
      escolaNome = escolaNome.split(/[.,;\n]/)[0].trim();
      if (escolaNome.length > 5 && escolaNome.length < 200) {
        dados.escolaNome = escolaNome;
        break;
      }
    }
  }

  return dados;
}
