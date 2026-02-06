import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const db = new Database(databaseUrl.replace('file:', ''));

// Dados fictícios de escolas de Santa Catarina
const escolasData = [
  { nome: 'Hermann Blumenau Complexo Educacional', municipio: 'Blumenau', rede: 'privada', inep: '42012345', cnpj: '12.345.678/0001-90' },
  { nome: 'Escola Estadual de Ensino Médio', municipio: 'Florianópolis', rede: 'estadual', inep: '42067890', cnpj: null },
  { nome: 'Colégio Dom Bosco', municipio: 'Joinville', rede: 'privada', inep: '42011111', cnpj: '11.111.111/0001-11' },
  { nome: 'Instituto Federal de Santa Catarina - Campus Florianópolis', municipio: 'Florianópolis', rede: 'federal', inep: '42022222', cnpj: null },
  { nome: 'Escola Municipal Professora Maria Silva', municipio: 'Chapecó', rede: 'municipal', inep: '42033333', cnpj: null },
  { nome: 'Colégio Positivo', municipio: 'Joinville', rede: 'privada', inep: '42044444', cnpj: '22.222.222/0001-22' },
  { nome: 'Escola Estadual João Paulo II', municipio: 'Criciúma', rede: 'estadual', inep: '42055555', cnpj: null },
  { nome: 'Instituto Educacional Santa Catarina', municipio: 'Blumenau', rede: 'privada', inep: '42066666', cnpj: '33.333.333/0001-33' },
  { nome: 'Escola Municipal de Educação Básica', municipio: 'Lages', rede: 'municipal', inep: '42077777', cnpj: null },
  { nome: 'Colégio Energia', municipio: 'Florianópolis', rede: 'privada', inep: '42088888', cnpj: '44.444.444/0001-44' },
  { nome: 'Escola Estadual de Ensino Fundamental', municipio: 'Itajaí', rede: 'estadual', inep: '42099999', cnpj: null },
  { nome: 'Instituto de Ensino Superior', municipio: 'Joinville', rede: 'privada', inep: '42010101', cnpj: '55.555.555/0001-55' },
  { nome: 'Escola Municipal Antônio Carlos', municipio: 'São José', rede: 'municipal', inep: '42020202', cnpj: null },
  { nome: 'Colégio Bom Jesus', municipio: 'Florianópolis', rede: 'privada', inep: '42030303', cnpj: '66.666.666/0001-66' },
  { nome: 'Escola Estadual de Educação Profissional', municipio: 'Blumenau', rede: 'estadual', inep: '42040404', cnpj: null },
  { nome: 'Instituto Técnico Industrial', municipio: 'Joinville', rede: 'privada', inep: '42050505', cnpj: '77.777.777/0001-77' },
  { nome: 'Escola Municipal de Tempo Integral', municipio: 'Chapecó', rede: 'municipal', inep: '42060606', cnpj: null },
  { nome: 'Colégio Marista', municipio: 'Florianópolis', rede: 'privada', inep: '42070707', cnpj: '88.888.888/0001-88' },
  { nome: 'Escola Estadual de Ensino Médio Integrado', municipio: 'Criciúma', rede: 'estadual', inep: '42080808', cnpj: null },
  { nome: 'Instituto de Educação e Cultura', municipio: 'Blumenau', rede: 'privada', inep: '42090909', cnpj: '99.999.999/0001-99' },
];

// Tipos de atos
const tiposAtos = ['Parecer', 'Resolução', 'Portaria', 'Deliberação'];
const statusVigencia = ['vigente', 'expirado', 'revogado'];
const orgaoEmissor = 'CEE-SC';

// Ementas variadas para pareceres
const ementasPareceres = [
  'Análise de solicitação de renovação de credenciamento',
  'Análise de solicitação de autorização de novo curso',
  'Análise de alteração de denominação da instituição',
  'Análise de ampliação de oferta de vagas',
  'Análise de mudança de endereço da instituição',
  'Análise de solicitação de recredenciamento',
  'Análise de autorização de funcionamento de nova unidade',
  'Análise de alteração de mantenedora',
  'Análise de solicitação de reconhecimento de curso',
  'Análise de renovação de autorização de curso técnico',
  'Análise de solicitação de credenciamento de instituição',
  'Análise de alteração de regimento escolar',
  'Análise de solicitação de autorização de curso de graduação',
  'Análise de renovação de reconhecimento',
  'Análise de solicitação de ampliação de modalidades',
];

// Observações variadas para atos
const observacoesAtos = [
  'pelo Credenciamento da Instituição',
  'pela Autorização para o funcionamento do Curso Técnico de Nível Médio',
  'sobre alteração de denominação da instituição',
  'pela renovação da autorização de funcionamento',
  'pela autorização para funcionamento da unidade escolar',
  'pelo reconhecimento do curso de ensino médio',
  'pela autorização de ampliação de oferta de vagas',
  'pela alteração de endereço da instituição',
  'pela renovação do credenciamento institucional',
  'pela autorização de funcionamento de nova unidade',
  'pelo reconhecimento do curso técnico',
  'pela alteração de mantenedora',
  'pela autorização de curso de educação profissional',
  'pela renovação do reconhecimento do curso',
  'pela autorização de ampliação de modalidades de ensino',
];

function gerarDataAleatoria(anoInicio: number, anoFim: number): string {
  const ano = Math.floor(Math.random() * (anoFim - anoInicio + 1)) + anoInicio;
  const mes = Math.floor(Math.random() * 12) + 1;
  const dia = Math.floor(Math.random() * 28) + 1;
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function escolherAleatorio<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function main() {
  console.log('🌱 Iniciando seed do banco de dados com dados robustos...');

  // Limpar dados existentes
  db.exec('DELETE FROM pareceres');
  db.exec('DELETE FROM atos_autorizativos');
  db.exec('DELETE FROM escolas');
  db.exec('DELETE FROM usuarios');

  // Criar usuários
  const usuarioConsultaId = 'user-consulta-001';
  const usuarioEdicaoId = 'user-edicao-001';

  // Hash bcrypt de "senha123"
  const senhaHash = '$2b$10$4vRWVA9J0qiqb.T1XXMKNOQOvEL6bxE1QKGc6bBq7dOLplDulc99C';

  const insertUsuario = db.prepare(
    'INSERT INTO usuarios (id, nome, email, senha, perfil, ativo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  insertUsuario.run(
    usuarioConsultaId,
    'Usuário Consulta',
    'consulta@cee.sc.gov.br',
    senhaHash,
    'consulta',
    1,
    new Date().toISOString(),
    new Date().toISOString()
  );

  insertUsuario.run(
    usuarioEdicaoId,
    'Usuário Edição',
    'edicao@cee.sc.gov.br',
    senhaHash,
    'edicao',
    1,
    new Date().toISOString(),
    new Date().toISOString()
  );

  console.log('✅ Usuários criados');

  // Criar escolas
  const insertEscola = db.prepare(
    'INSERT INTO escolas (id, nome_oficial, codigo_inep, cnpj, municipio, rede_ensino, situacao, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const escolasIds: string[] = [];
  escolasData.forEach((escola, index) => {
    const id = `escola-${String(index + 1).padStart(3, '0')}`;
    escolasIds.push(id);
    const situacao = Math.random() > 0.1 ? 'ativa' : 'inativa'; // 90% ativas
    
    insertEscola.run(
      id,
      escola.nome,
      escola.inep,
      escola.cnpj,
      escola.municipio,
      escola.rede,
      situacao,
      new Date().toISOString(),
      new Date().toISOString()
    );
  });

  console.log(`✅ ${escolasData.length} escolas criadas`);

  // Criar atos autorizativos (média de 2-3 atos por escola)
  const insertAto = db.prepare(
    'INSERT INTO atos_autorizativos (id, escola_id, tipo_ato, numero_ato, ano_ato, data_publicacao, orgao_emissor, ementa_resumo, status_vigencia, observacoes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  let totalAtos = 0;
  escolasIds.forEach((escolaId, escolaIndex) => {
    const numAtos = Math.floor(Math.random() * 3) + 2; // 2 a 4 atos por escola
    
    for (let i = 0; i < numAtos; i++) {
      const atoId = uuidv4();
      const tipoAto = escolherAleatorio(tiposAtos);
      const numeroAto = String(Math.floor(Math.random() * 500) + 1);
      const anoAto = Math.floor(Math.random() * 10) + 2015; // 2015 a 2024
      const dataPublicacao = gerarDataAleatoria(2015, 2024);
      const status = escolherAleatorio(statusVigencia);
      const observacao = escolherAleatorio(observacoesAtos);
      const ementaResumo = observacao.substring(0, 50);
      
      insertAto.run(
        atoId,
        escolaId,
        tipoAto,
        numeroAto,
        anoAto,
        dataPublicacao,
        orgaoEmissor,
        ementaResumo,
        status,
        observacao,
        new Date().toISOString(),
        new Date().toISOString()
      );
      totalAtos++;
    }
  });

  console.log(`✅ ${totalAtos} atos autorizativos criados`);

  // Criar pareceres (30 pareceres distribuídos entre as escolas)
  const insertParecer = db.prepare(
    'INSERT INTO pareceres (id, escola_id, numero_parecer, ano_parecer, data_parecer, ementa, texto_atos_gerado, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  let numeroParecer = 1;
  const anosPareceres = [2022, 2023, 2024];
  
  for (let i = 0; i < 30; i++) {
    const parecerId = uuidv4();
    const escolaId = escolherAleatorio(escolasIds);
    const anoParecer = escolherAleatorio(anosPareceres);
    const dataParecer = gerarDataAleatoria(anoParecer, anoParecer);
    const ementa = escolherAleatorio(ementasPareceres);
    const status = Math.random() > 0.3 ? 'rascunho' : 'finalizado'; // 70% rascunho
    const textoGerado = status === 'finalizado' && Math.random() > 0.5 
      ? 'Texto gerado automaticamente para teste do sistema.' 
      : null;
    
    insertParecer.run(
      parecerId,
      escolaId,
      numeroParecer,
      anoParecer,
      dataParecer,
      ementa,
      textoGerado,
      status,
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    numeroParecer++;
  }

  console.log(`✅ 30 pareceres criados`);

  db.close();
  console.log('🎉 Seed concluído com sucesso!');
  console.log(`📊 Resumo:`);
  console.log(`   - ${escolasData.length} escolas`);
  console.log(`   - ${totalAtos} atos autorizativos`);
  console.log(`   - 30 pareceres`);
}

main().catch((e) => {
  console.error('❌ Erro ao executar seed:', e);
  process.exit(1);
});
