import Database from 'better-sqlite3';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const sqlite = new Database(databaseUrl.replace('file:', ''));

interface AtoIncompleto {
  id: string;
  tipoAto: string;
  numeroAto: string;
  dataPublicacao: string;
  camposFaltantes: string[];
}

interface ResultadoValidacao {
  valido: boolean;
  atosIncompletos: AtoIncompleto[];
  mensagem?: string;
}

// Campos obrigatórios conforme documentação
const CAMPOS_OBRIGATORIOS = [
  'tipo_ato',
  'numero_ato',
  'data_publicacao',
  'orgao_emissor',
  'status_vigencia',
  'observacoes',
];

function validarAto(ato: any): string[] {
  const camposFaltantes: string[] = [];
  
  CAMPOS_OBRIGATORIOS.forEach(campo => {
    const valor = ato[campo];
    if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
      camposFaltantes.push(campo);
    }
  });
  
  return camposFaltantes;
}

function formatarNomeCampo(campo: string): string {
  const nomes: { [key: string]: string } = {
    tipo_ato: 'tipo do ato',
    numero_ato: 'número do ato',
    data_publicacao: 'data de publicação',
    orgao_emissor: 'órgão emissor',
    status_vigencia: 'status de vigência',
    observacoes: 'observações',
  };
  
  return nomes[campo] || campo;
}

export function validarAtosEscola(escolaId: string): ResultadoValidacao {
  // Verificar se escola existe
  const escola = sqlite.prepare('SELECT id FROM escolas WHERE id = ?').get(escolaId) as any;
  if (!escola) {
    return {
      valido: false,
      atosIncompletos: [],
      mensagem: 'Escola não encontrada',
    };
  }
  
  // Buscar todos os atos da escola
  const atos = sqlite.prepare(`
    SELECT * FROM atos_autorizativos 
    WHERE escola_id = ?
  `).all(escolaId) as any[];
  
  if (atos.length === 0) {
    return {
      valido: false,
      atosIncompletos: [],
      mensagem: 'A escola selecionada não possui atos autorizativos cadastrados. Por favor, cadastre pelo menos um ato autorizativo antes de gerar o texto.',
    };
  }
  
  // Validar cada ato
  const atosIncompletos: AtoIncompleto[] = [];
  
  atos.forEach(ato => {
    const camposFaltantes = validarAto(ato);
    if (camposFaltantes.length > 0) {
      atosIncompletos.push({
        id: ato.id,
        tipoAto: ato.tipo_ato || 'N/A',
        numeroAto: ato.numero_ato || 'N/A',
        dataPublicacao: ato.data_publicacao 
          ? new Date(ato.data_publicacao).toLocaleDateString('pt-BR')
          : 'N/A',
        camposFaltantes: camposFaltantes.map(formatarNomeCampo),
      });
    }
  });
  
  if (atosIncompletos.length > 0) {
    // Construir mensagem detalhada
    let mensagem = 'Existem atos autorizativos com dados obrigatórios incompletos. Por favor, corrija os seguintes itens antes de gerar o texto:\n\n';
    mensagem += '**Atos com dados incompletos:**\n';
    
    atosIncompletos.forEach(ato => {
      mensagem += `- ${ato.tipoAto} Nº${ato.numeroAto} de ${ato.dataPublicacao} — faltam: ${ato.camposFaltantes.join(', ')}\n`;
    });
    
    mensagem += '\n**Campos obrigatórios:** tipo do ato, número do ato, data de publicação, órgão emissor, status de vigência, observações.';
    
    return {
      valido: false,
      atosIncompletos,
      mensagem,
    };
  }
  
  return {
    valido: true,
    atosIncompletos: [],
  };
}

function formatarData(data: string): string {
  const date = new Date(data);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function capitalizarPrimeiraLetra(texto: string): string {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function gerarTextoAtos(escolaId: string): string {
  // Buscar atos ordenados por data_publicacao (crescente)
  // Em caso de empate, ordenar por numero_ato (crescente)
  const atos = sqlite.prepare(`
    SELECT tipo_ato, numero_ato, data_publicacao, observacoes
    FROM atos_autorizativos
    WHERE escola_id = ?
    ORDER BY data_publicacao ASC, numero_ato ASC, tipo_ato ASC
  `).all(escolaId) as any[];
  
  // Ordenar manualmente por número (para garantir ordem numérica correta)
  atos.sort((a, b) => {
    // Primeiro por data
    const dataA = new Date(a.data_publicacao).getTime();
    const dataB = new Date(b.data_publicacao).getTime();
    if (dataA !== dataB) {
      return dataA - dataB;
    }
    
    // Se mesma data, ordenar por número (numérico)
    const numA = parseInt(a.numero_ato) || 0;
    const numB = parseInt(b.numero_ato) || 0;
    if (numA !== numB) {
      return numA - numB;
    }
    
    // Se mesmo número, ordenar por tipo
    return a.tipo_ato.localeCompare(b.tipo_ato);
  });
  
  if (atos.length === 0) {
    return '';
  }
  
  const partes: string[] = [];
  
  atos.forEach((ato, index) => {
    const tipoAto = capitalizarPrimeiraLetra(ato.tipo_ato);
    const numeroAto = ato.numero_ato;
    const dataFormatada = formatarData(ato.data_publicacao);
    const observacoes = ato.observacoes.trim();
    
    // Formato: [Tipo do Ato] Nº[numero] de [data]: [observacoes]
    const parte = `${tipoAto} Nº${numeroAto} de ${dataFormatada}: ${observacoes}`;
    
    // Último ato termina com ponto final, outros com ponto e vírgula
    if (index === atos.length - 1) {
      partes.push(parte + '.');
    } else {
      partes.push(parte + ';');
    }
  });
  
  // Juntar todas as partes com espaço
  return partes.join(' ');
}
