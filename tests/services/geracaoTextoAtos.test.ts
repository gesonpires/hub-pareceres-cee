import { validarAtosEscola, gerarTextoAtos } from '../../src/services/geracaoTextoAtos';
import Database from 'better-sqlite3';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL || 'file:./test.db';
const sqlite = new Database(databaseUrl.replace('file:', ''));

describe('Geração de Texto de Atos Autorizativos', () => {
  let escolaId: string;
  
  beforeEach(() => {
    // Criar banco de teste em memória
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS escolas (
        id TEXT PRIMARY KEY,
        nome_oficial TEXT NOT NULL,
        codigo_inep TEXT,
        cnpj TEXT,
        municipio TEXT,
        rede_ensino TEXT,
        situacao TEXT NOT NULL DEFAULT 'ativa',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS atos_autorizativos (
        id TEXT PRIMARY KEY,
        escola_id TEXT NOT NULL,
        tipo_ato TEXT NOT NULL,
        numero_ato TEXT NOT NULL,
        ano_ato INTEGER,
        data_publicacao DATETIME NOT NULL,
        orgao_emissor TEXT NOT NULL,
        ementa_resumo TEXT,
        inicio_vigencia DATETIME,
        fim_vigencia DATETIME,
        status_vigencia TEXT NOT NULL,
        observacoes TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (escola_id) REFERENCES escolas(id)
      );
    `);
    
    // Criar escola de teste
    escolaId = 'test-escola-001';
    sqlite.prepare(`
      INSERT INTO escolas (id, nome_oficial, situacao, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(escolaId, 'Escola Teste', 'ativa', new Date().toISOString(), new Date().toISOString());
  });
  
  afterEach(() => {
    sqlite.exec('DELETE FROM atos_autorizativos');
    sqlite.exec('DELETE FROM escolas');
  });
  
  describe('Validação de campos obrigatórios', () => {
    test('deve retornar erro quando escola não existe', () => {
      const resultado = validarAtosEscola('escola-inexistente');
      expect(resultado.valido).toBe(false);
      expect(resultado.mensagem).toContain('Escola não encontrada');
    });
    
    test('deve retornar erro quando escola não tem atos', () => {
      const resultado = validarAtosEscola(escolaId);
      expect(resultado.valido).toBe(false);
      expect(resultado.mensagem).toContain('não possui atos autorizativos cadastrados');
    });
    
    test('deve retornar erro quando ato está incompleto (falta tipo_ato)', () => {
      sqlite.prepare(`
        INSERT INTO atos_autorizativos (
          id, escola_id, tipo_ato, numero_ato, data_publicacao,
          orgao_emissor, status_vigencia, observacoes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'ato-001',
        escolaId,
        '', // tipo_ato vazio
        '123',
        '2024-01-15',
        'CEE-SC',
        'vigente',
        'Observações do ato',
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      const resultado = validarAtosEscola(escolaId);
      expect(resultado.valido).toBe(false);
      expect(resultado.atosIncompletos.length).toBe(1);
      expect(resultado.atosIncompletos[0].camposFaltantes).toContain('tipo do ato');
    });
    
    test('deve retornar erro quando ato está incompleto (falta observacoes)', () => {
      sqlite.prepare(`
        INSERT INTO atos_autorizativos (
          id, escola_id, tipo_ato, numero_ato, data_publicacao,
          orgao_emissor, status_vigencia, observacoes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'ato-001',
        escolaId,
        'Parecer',
        '123',
        '2024-01-15',
        'CEE-SC',
        'vigente',
        '', // observacoes vazio
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      const resultado = validarAtosEscola(escolaId);
      expect(resultado.valido).toBe(false);
      expect(resultado.atosIncompletos[0].camposFaltantes).toContain('observações');
    });
    
    test('deve validar quando todos os atos estão completos', () => {
      sqlite.prepare(`
        INSERT INTO atos_autorizativos (
          id, escola_id, tipo_ato, numero_ato, data_publicacao,
          orgao_emissor, status_vigencia, observacoes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'ato-001',
        escolaId,
        'Parecer',
        '123',
        '2024-01-15',
        'CEE-SC',
        'vigente',
        'Observações completas',
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      const resultado = validarAtosEscola(escolaId);
      expect(resultado.valido).toBe(true);
      expect(resultado.atosIncompletos.length).toBe(0);
    });
    
    test('deve identificar múltiplos atos incompletos', () => {
      // Ato 1 incompleto (falta observacoes)
      sqlite.prepare(`
        INSERT INTO atos_autorizativos (
          id, escola_id, tipo_ato, numero_ato, data_publicacao,
          orgao_emissor, status_vigencia, observacoes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'ato-001',
        escolaId,
        'Parecer',
        '123',
        '2024-01-15',
        'CEE-SC',
        'vigente',
        '', // incompleto
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      // Ato 2 incompleto (falta orgao_emissor)
      sqlite.prepare(`
        INSERT INTO atos_autorizativos (
          id, escola_id, tipo_ato, numero_ato, data_publicacao,
          orgao_emissor, status_vigencia, observacoes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'ato-002',
        escolaId,
        'Resolução',
        '456',
        '2024-02-20',
        '', // incompleto
        'vigente',
        'Observações',
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      const resultado = validarAtosEscola(escolaId);
      expect(resultado.valido).toBe(false);
      expect(resultado.atosIncompletos.length).toBe(2);
    });
  });
  
  describe('Ordenação por data_publicacao', () => {
    test('deve ordenar atos por data de publicação crescente', () => {
      // Ato mais recente primeiro (será ordenado por último)
      sqlite.prepare(`
        INSERT INTO atos_autorizativos (
          id, escola_id, tipo_ato, numero_ato, data_publicacao,
          orgao_emissor, status_vigencia, observacoes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'ato-003',
        escolaId,
        'Parecer',
        '300',
        '2024-03-15', // Mais recente
        'CEE-SC',
        'vigente',
        'Terceiro ato',
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      // Ato mais antigo (será primeiro)
      sqlite.prepare(`
        INSERT INTO atos_autorizativos (
          id, escola_id, tipo_ato, numero_ato, data_publicacao,
          orgao_emissor, status_vigencia, observacoes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'ato-001',
        escolaId,
        'Parecer',
        '100',
        '2024-01-15', // Mais antigo
        'CEE-SC',
        'vigente',
        'Primeiro ato',
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      // Ato do meio
      sqlite.prepare(`
        INSERT INTO atos_autorizativos (
          id, escola_id, tipo_ato, numero_ato, data_publicacao,
          orgao_emissor, status_vigencia, observacoes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'ato-002',
        escolaId,
        'Resolução',
        '200',
        '2024-02-20', // Meio
        'CEE-SC',
        'vigente',
        'Segundo ato',
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      const texto = gerarTextoAtos(escolaId);
      
      // Verificar que primeiro ato aparece primeiro no texto
      expect(texto).toContain('Primeiro ato');
      expect(texto).toContain('Segundo ato');
      expect(texto).toContain('Terceiro ato');
      
      // Verificar ordem: primeiro deve aparecer antes de segundo
      const indexPrimeiro = texto.indexOf('Primeiro ato');
      const indexSegundo = texto.indexOf('Segundo ato');
      const indexTerceiro = texto.indexOf('Terceiro ato');
      
      expect(indexPrimeiro).toBeLessThan(indexSegundo);
      expect(indexSegundo).toBeLessThan(indexTerceiro);
    });
    
    test('deve ordenar por número quando datas são iguais', () => {
      const mesmaData = '2024-01-15';
      
      // Ato com número maior
      sqlite.prepare(`
        INSERT INTO atos_autorizativos (
          id, escola_id, tipo_ato, numero_ato, data_publicacao,
          orgao_emissor, status_vigencia, observacoes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'ato-002',
        escolaId,
        'Parecer',
        '200', // Número maior
        mesmaData,
        'CEE-SC',
        'vigente',
        'Segundo ato',
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      // Ato com número menor (deve aparecer primeiro)
      sqlite.prepare(`
        INSERT INTO atos_autorizativos (
          id, escola_id, tipo_ato, numero_ato, data_publicacao,
          orgao_emissor, status_vigencia, observacoes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'ato-001',
        escolaId,
        'Resolução',
        '100', // Número menor
        mesmaData,
        'CEE-SC',
        'vigente',
        'Primeiro ato',
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      const texto = gerarTextoAtos(escolaId);
      
      // Verificar que ato com número menor aparece primeiro
      const indexPrimeiro = texto.indexOf('Primeiro ato');
      const indexSegundo = texto.indexOf('Segundo ato');
      expect(indexPrimeiro).toBeLessThan(indexSegundo);
    });
  });
  
  describe('Formatação do texto', () => {
    test('deve formatar texto conforme template', () => {
      sqlite.prepare(`
        INSERT INTO atos_autorizativos (
          id, escola_id, tipo_ato, numero_ato, data_publicacao,
          orgao_emissor, status_vigencia, observacoes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'ato-001',
        escolaId,
        'Parecer',
        '279',
        '2014-08-19',
        'CEE-SC',
        'vigente',
        'pelo Credenciamento da Instituição',
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      const texto = gerarTextoAtos(escolaId);
      
      // Verificar formato: Tipo Nºnumero de data: observacoes.
      expect(texto).toMatch(/^Parecer Nº279 de \d{2}\/\d{2}\/2014: pelo Credenciamento da Instituição\.$/);
    });
    
    test('deve separar múltiplos atos com ponto e vírgula', () => {
      sqlite.prepare(`
        INSERT INTO atos_autorizativos (
          id, escola_id, tipo_ato, numero_ato, data_publicacao,
          orgao_emissor, status_vigencia, observacoes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'ato-001',
        escolaId,
        'Parecer',
        '100',
        '2024-01-15',
        'CEE-SC',
        'vigente',
        'Primeiro ato',
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      sqlite.prepare(`
        INSERT INTO atos_autorizativos (
          id, escola_id, tipo_ato, numero_ato, data_publicacao,
          orgao_emissor, status_vigencia, observacoes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'ato-002',
        escolaId,
        'Resolução',
        '200',
        '2024-02-20',
        'CEE-SC',
        'vigente',
        'Segundo ato',
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      const texto = gerarTextoAtos(escolaId);
      
      // Verificar que há ponto e vírgula entre os atos
      expect(texto).toContain(';');
      // Verificar que último ato termina com ponto final
      expect(texto.endsWith('.')).toBe(true);
    });
    
    test('deve terminar com ponto final quando há apenas um ato', () => {
      sqlite.prepare(`
        INSERT INTO atos_autorizativos (
          id, escola_id, tipo_ato, numero_ato, data_publicacao,
          orgao_emissor, status_vigencia, observacoes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'ato-001',
        escolaId,
        'Parecer',
        '100',
        '2024-01-15',
        'CEE-SC',
        'vigente',
        'Único ato',
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      const texto = gerarTextoAtos(escolaId);
      
      // Não deve ter ponto e vírgula, apenas ponto final
      expect(texto).not.toContain(';');
      expect(texto.endsWith('.')).toBe(true);
    });
  });
});
