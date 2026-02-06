import Database from 'better-sqlite3';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const db = new Database(databaseUrl.replace('file:', ''));

async function main() {
  console.log('🌱 Iniciando seed do banco de dados (SQL direto)...');

  // Limpar dados existentes
  db.exec('DELETE FROM pareceres');
  db.exec('DELETE FROM atos_autorizativos');
  db.exec('DELETE FROM escolas');
  db.exec('DELETE FROM usuarios');

  // Criar usuários
  const usuarioConsultaId = 'user-consulta-001';
  const usuarioEdicaoId = 'user-edicao-001';

  // Hash bcrypt de "senha123" para ambos os usuários
  const senhaHash = '$2b$10$4vRWVA9J0qiqb.T1XXMKNOQOvEL6bxE1QKGc6bBq7dOLplDulc99C';

  db.prepare(
    'INSERT INTO usuarios (id, nome, email, senha, perfil, ativo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    usuarioConsultaId,
    'Usuário Consulta',
    'consulta@cee.sc.gov.br',
    senhaHash,
    'consulta',
    1,
    new Date().toISOString(),
    new Date().toISOString()
  );

  db.prepare(
    'INSERT INTO usuarios (id, nome, email, senha, perfil, ativo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
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
  const escola1Id = 'escola-001';
  const escola2Id = 'escola-002';

  db.prepare(
    'INSERT INTO escolas (id, nome_oficial, codigo_inep, cnpj, municipio, rede_ensino, situacao, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    escola1Id,
    'Hermann Blumenau Complexo Educacional',
    '42012345',
    '12.345.678/0001-90',
    'Blumenau',
    'privada',
    'ativa',
    new Date().toISOString(),
    new Date().toISOString()
  );

  db.prepare(
    'INSERT INTO escolas (id, nome_oficial, codigo_inep, cnpj, municipio, rede_ensino, situacao, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    escola2Id,
    'Escola Estadual de Ensino Médio',
    '42067890',
    null,
    'Florianópolis',
    'estadual',
    'ativa',
    new Date().toISOString(),
    new Date().toISOString()
  );

  console.log('✅ Escolas criadas');

  // Criar atos autorizativos
  const ato1Id = 'ato-001';
  const ato2Id = 'ato-002';
  const ato3Id = 'ato-003';
  const ato4Id = 'ato-004';
  const ato5Id = 'ato-005';

  const insertAto = db.prepare(
    'INSERT INTO atos_autorizativos (id, escola_id, tipo_ato, numero_ato, ano_ato, data_publicacao, orgao_emissor, ementa_resumo, status_vigencia, observacoes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  insertAto.run(
    ato1Id,
    escola1Id,
    'Parecer',
    '279',
    2014,
    '2014-08-19',
    'CEE-SC',
    'Credenciamento da Instituição',
    'vigente',
    'pelo Credenciamento da Instituição Hermann Blumenau Complexo Educacional, do Município de Blumenau, mantido por Hermann Blumenau Instituto de Educação Ltda.-ME, pertencente à rede privada de ensino, localizada à Rua Alameda Duque de Caxias, nº 20, Bairro Centro, no Município de Blumenau – SC e pela Autorização para o funcionamento do Curso Técnico de Nível Médio em Saúde Bucal, Eixo Tecnológico de Ambiente e Saúde',
    new Date().toISOString(),
    new Date().toISOString()
  );

  insertAto.run(
    ato2Id,
    escola1Id,
    'Parecer',
    '150',
    2015,
    '2015-05-10',
    'CEE-SC',
    'Autorização de Curso',
    'vigente',
    'pela Autorização para o funcionamento do Curso Técnico de Nível Médio em Enfermagem',
    new Date().toISOString(),
    new Date().toISOString()
  );

  insertAto.run(
    ato3Id,
    escola1Id,
    'Resolução',
    '45',
    2016,
    '2016-03-15',
    'CEE-SC',
    'Alteração de denominação',
    'vigente',
    'sobre alteração de denominação da instituição',
    new Date().toISOString(),
    new Date().toISOString()
  );

  insertAto.run(
    ato4Id,
    escola2Id,
    'Parecer',
    '100',
    2020,
    '2020-01-15',
    'CEE-SC',
    'Autorização de funcionamento',
    'vigente',
    'pela autorização para funcionamento da unidade escolar',
    new Date().toISOString(),
    new Date().toISOString()
  );

  insertAto.run(
    ato5Id,
    escola2Id,
    'Portaria',
    '200',
    2021,
    '2021-06-20',
    'CEE-SC',
    'Renovação de autorização',
    'vigente',
    'pela renovação da autorização de funcionamento',
    new Date().toISOString(),
    new Date().toISOString()
  );

  console.log('✅ Atos autorizativos criados');

  // Criar pareceres
  const parecer1Id = 'parecer-001';
  const parecer2Id = 'parecer-002';

  const insertParecer = db.prepare(
    'INSERT INTO pareceres (id, escola_id, numero_parecer, ano_parecer, data_parecer, ementa, texto_atos_gerado, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  insertParecer.run(
    parecer1Id,
    escola1Id,
    1,
    2024,
    '2024-01-10',
    'Análise de solicitação de renovação de credenciamento',
    null,
    'rascunho',
    new Date().toISOString(),
    new Date().toISOString()
  );

  insertParecer.run(
    parecer2Id,
    escola2Id,
    2,
    2024,
    '2024-02-15',
    'Análise de solicitação de autorização de novo curso',
    'Parecer Nº100 de 15/01/2020: pela autorização para funcionamento da unidade escolar; Portaria Nº200 de 20/06/2021: pela renovação da autorização de funcionamento.',
    'finalizado',
    new Date().toISOString(),
    new Date().toISOString()
  );

  console.log('✅ Pareceres criados');

  db.close();
  console.log('🎉 Seed concluído com sucesso!');
}

main().catch((e) => {
  console.error('❌ Erro ao executar seed:', e);
  process.exit(1);
});
