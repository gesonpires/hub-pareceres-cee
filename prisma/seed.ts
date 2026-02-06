import { PrismaClient } from '@prisma/client';
import { PrismaClient as PrismaClientType } from '@prisma/client';
import Database from 'better-sqlite3';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const sqliteDb = new Database(databaseUrl.replace('file:', ''));

const prisma = new PrismaClient({
  adapter: {
    kind: 'sqlite',
    url: databaseUrl,
    database: sqliteDb as any,
  },
} as any);

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.parecer.deleteMany();
  await prisma.atosAutorizativos.deleteMany();
  await prisma.escola.deleteMany();
  await prisma.usuario.deleteMany();

  // Criar usuários
  const usuarioConsulta = await prisma.usuario.create({
    data: {
      nome: 'Usuário Consulta',
      email: 'consulta@cee.sc.gov.br',
      perfil: 'consulta',
      ativo: true,
    },
  });

  const usuarioEdicao = await prisma.usuario.create({
    data: {
      nome: 'Usuário Edição',
      email: 'edicao@cee.sc.gov.br',
      perfil: 'edicao',
      ativo: true,
    },
  });

  console.log('✅ Usuários criados:', { usuarioConsulta, usuarioEdicao });

  // Criar escolas
  const escola1 = await prisma.escola.create({
    data: {
      nomeOficial: 'Hermann Blumenau Complexo Educacional',
      codigoIneq: '42012345',
      cnpj: '12.345.678/0001-90',
      municipio: 'Blumenau',
      redeEnsino: 'privada',
      situacao: 'ativa',
    },
  });

  const escola2 = await prisma.escola.create({
    data: {
      nomeOficial: 'Escola Estadual de Ensino Médio',
      codigoIneq: '42067890',
      cnpj: null,
      municipio: 'Florianópolis',
      redeEnsino: 'estadual',
      situacao: 'ativa',
    },
  });

  console.log('✅ Escolas criadas:', { escola1, escola2 });

  // Criar atos autorizativos para escola1
  const ato1 = await prisma.atosAutorizativos.create({
    data: {
      escolaId: escola1.id,
      tipoAto: 'Parecer',
      numeroAto: '279',
      anoAto: 2014,
      dataPublicacao: new Date('2014-08-19'),
      orgaoEmissor: 'CEE-SC',
      ementaResumo: 'Credenciamento da Instituição',
      statusVigencia: 'vigente',
      observacoes: 'pelo Credenciamento da Instituição Hermann Blumenau Complexo Educacional, do Município de Blumenau, mantido por Hermann Blumenau Instituto de Educação Ltda.-ME, pertencente à rede privada de ensino, localizada à Rua Alameda Duque de Caxias, nº 20, Bairro Centro, no Município de Blumenau – SC e pela Autorização para o funcionamento do Curso Técnico de Nível Médio em Saúde Bucal, Eixo Tecnológico de Ambiente e Saúde',
    },
  });

  const ato2 = await prisma.atosAutorizativos.create({
    data: {
      escolaId: escola1.id,
      tipoAto: 'Parecer',
      numeroAto: '150',
      anoAto: 2015,
      dataPublicacao: new Date('2015-05-10'),
      orgaoEmissor: 'CEE-SC',
      ementaResumo: 'Autorização de Curso',
      statusVigencia: 'vigente',
      observacoes: 'pela Autorização para o funcionamento do Curso Técnico de Nível Médio em Enfermagem',
    },
  });

  const ato3 = await prisma.atosAutorizativos.create({
    data: {
      escolaId: escola1.id,
      tipoAto: 'Resolução',
      numeroAto: '45',
      anoAto: 2016,
      dataPublicacao: new Date('2016-03-15'),
      orgaoEmissor: 'CEE-SC',
      ementaResumo: 'Alteração de denominação',
      statusVigencia: 'vigente',
      observacoes: 'sobre alteração de denominação da instituição',
    },
  });

  const ato4 = await prisma.atosAutorizativos.create({
    data: {
      escolaId: escola2.id,
      tipoAto: 'Parecer',
      numeroAto: '100',
      anoAto: 2020,
      dataPublicacao: new Date('2020-01-15'),
      orgaoEmissor: 'CEE-SC',
      ementaResumo: 'Autorização de funcionamento',
      statusVigencia: 'vigente',
      observacoes: 'pela autorização para funcionamento da unidade escolar',
    },
  });

  const ato5 = await prisma.atosAutorizativos.create({
    data: {
      escolaId: escola2.id,
      tipoAto: 'Portaria',
      numeroAto: '200',
      anoAto: 2021,
      dataPublicacao: new Date('2021-06-20'),
      orgaoEmissor: 'CEE-SC',
      ementaResumo: 'Renovação de autorização',
      statusVigencia: 'vigente',
      observacoes: 'pela renovação da autorização de funcionamento',
    },
  });

  console.log('✅ Atos autorizativos criados:', { ato1, ato2, ato3, ato4, ato5 });

  // Criar pareceres
  const parecer1 = await prisma.parecer.create({
    data: {
      escolaId: escola1.id,
      numeroParecer: 1,
      anoParecer: 2024,
      dataParecer: new Date('2024-01-10'),
      ementa: 'Análise de solicitação de renovação de credenciamento',
      status: 'rascunho',
    },
  });

  const parecer2 = await prisma.parecer.create({
    data: {
      escolaId: escola2.id,
      numeroParecer: 2,
      anoParecer: 2024,
      dataParecer: new Date('2024-02-15'),
      ementa: 'Análise de solicitação de autorização de novo curso',
      status: 'finalizado',
      textoAtosGerado: 'Parecer Nº100 de 15/01/2020: pela autorização para funcionamento da unidade escolar; Portaria Nº200 de 20/06/2021: pela renovação da autorização de funcionamento.',
    },
  });

  console.log('✅ Pareceres criados:', { parecer1, parecer2 });

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
