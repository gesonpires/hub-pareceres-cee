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
  // Também: "CEE_SC_013_2025", "CEE/SC 013/2025", etc.
  const parecerPatterns = [
    /parecer\s*(?:n[º°]|nº|n[°]|n\.?\s*)?\s*(\d+)\s*\/\s*(\d{4})/i,
    /parecer\s*(?:n[º°]|nº|n[°]|n\.?\s*)?\s*(\d+)\s+(?:de\s+)?(\d{4})/i,
    /cee[_\s\/]*sc[_\s]*(\d+)[_\s]*(\d{4})/i,
    /parecer\s*cee[_\s\/]*sc[_\s]*(\d+)[_\s]*(\d{4})/i,
    /(\d{3,4})\s*\/\s*(\d{4})/,
    /n[º°]?\s*(\d+)\s*\/\s*(\d{4})/i
  ];

  for (const pattern of parecerPatterns) {
    const match = textoNormalizado.match(pattern);
    if (match) {
      const numero = parseInt(match[1]);
      const ano = parseInt(match[2]);
      if (numero > 0 && ano >= 2000 && ano <= 2100) {
        dados.numeroParecer = numero;
        dados.anoParecer = ano;
        break;
      }
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

  // Tentar extrair ementa (OBJETO no parecer)
  // Priorizar "OBJETO" que é o termo usado nos pareceres
  // Padrões: "OBJETO:", "Objeto:", "Ementa:", etc.
  const ementaPatterns = [
    /(?:objeto|o\s*b\s*j\s*e\s*t\s*o)[\s:]*([^\n]{50,1000})/i,
    /(?:ementa|e\s*m\s*e\s*n\s*t\s*a)[\s:]*([^\n]{50,800})/i,
    /(?:resumo)[\s:]*([^\n]{50,800})/i,
    /(?:sobre|trata[\s-]?se|referente)[\s:]*([^\n]{50,800})/i
  ];

  for (const pattern of ementaPatterns) {
    const match = texto.match(pattern);
    if (match && match[1]) {
      // Pegar até 800 caracteres após a palavra-chave
      let ementa = match[1].trim();
      // Remover quebras de linha excessivas e normalizar espaços
      ementa = ementa.replace(/\s+/g, ' ').trim();
      // Limitar tamanho
      if (ementa.length > 800) {
        ementa = ementa.substring(0, 800) + '...';
      }
      if (ementa.length >= 20) { // Só aceitar se tiver pelo menos 20 caracteres
        dados.ementa = ementa;
        break;
      }
    }
  }
  
  // Se não encontrou ementa específica, tentar pegar o primeiro parágrafo significativo
  if (!dados.ementa) {
    const linhas = texto.split(/\n+/).filter(linha => linha.trim().length > 20);
    if (linhas.length > 0) {
      const primeiraLinha = linhas[0].trim().replace(/\s+/g, ' ');
      if (primeiraLinha.length >= 20 && primeiraLinha.length <= 800) {
        dados.ementa = primeiraLinha;
      }
    }
  }

  // Tentar extrair nome da escola
  // Padrões: "Escola:", "Instituição:", "Estabelecimento:", "Colegio", etc.
  const escolaPatterns = [
    /(?:escola|institui[çc][ãa]o|estabelecimento|colegio|col[ée]gio)[\s:]*([^\n]{10,200})/i,
    /(?:denomina[çc][ãa]o)[\s:]*([^\n]{10,200})/i,
    /(?:requerente|requerido)[\s:]*([^\n]{10,200})/i
  ];

  for (const pattern of escolaPatterns) {
    const match = texto.match(pattern);
    if (match && match[1]) {
      let escolaNome = match[1].trim();
      // Pegar até o primeiro ponto, vírgula, quebra de linha ou palavra-chave
      escolaNome = escolaNome.split(/[.,;\n]|(?:munic[ií]pio|cnpj|codigo)/i)[0].trim();
      // Remover espaços excessivos
      escolaNome = escolaNome.replace(/\s+/g, ' ').trim();
      if (escolaNome.length > 5 && escolaNome.length < 200) {
        dados.escolaNome = escolaNome;
        break;
      }
    }
  }
  
  // Se não encontrou, tentar extrair do nome do arquivo (se disponível)
  // Isso será feito no importadorPareceres se necessário

  return dados;
}
