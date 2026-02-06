interface DadosParecerSugeridos {
  numeroParecer?: number;
  anoParecer?: number;
  textoCompleto: string;
}

/**
 * Extrai apenas informações básicas do nome do arquivo.
 * O usuário preencherá os demais campos manualmente.
 */
export function parsearParecer(texto: string, nomeArquivo: string): DadosParecerSugeridos {
  const dados: DadosParecerSugeridos = {
    textoCompleto: texto
  };

  // Tentar extrair número e ano do nome do arquivo
  // Padrão: CEE_SC_XXX_YYYY
  const nomeMatch = nomeArquivo.match(/cee[_\s\/]*sc[_\s]*(\d+)[_\s]*(\d{4})/i);
  if (nomeMatch) {
    const numero = parseInt(nomeMatch[1]);
    const ano = parseInt(nomeMatch[2]);
    if (numero > 0 && ano >= 2000 && ano <= 2100) {
      dados.numeroParecer = numero;
      dados.anoParecer = ano;
    }
  }

  return dados;
}
