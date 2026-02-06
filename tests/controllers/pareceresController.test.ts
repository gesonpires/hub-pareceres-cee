import Database from 'better-sqlite3';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL || 'file:./test.db';
const sqlite = new Database(databaseUrl.replace('file:', ''));

describe('Filtros de Pareceres', () => {
  let escolaId1: string;
  let escolaId2: string;
  
  beforeEach(() => {
    // Criar estrutura de banco
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
      
      CREATE TABLE IF NOT EXISTS pareceres (
        id TEXT PRIMARY KEY,
        escola_id TEXT NOT NULL,
        numero_parecer INTEGER NOT NULL,
        ano_parecer INTEGER NOT NULL,
        data_parecer DATETIME NOT NULL,
        ementa TEXT NOT NULL,
        texto_atos_gerado TEXT,
        status TEXT NOT NULL DEFAULT 'rascunho',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (escola_id) REFERENCES escolas(id)
      );
    `);
    
    // Criar escolas de teste
    escolaId1 = 'escola-001';
    escolaId2 = 'escola-002';
    
    // Limpar dados antes de inserir
    sqlite.exec('DELETE FROM pareceres');
    sqlite.exec('DELETE FROM escolas');
    
    sqlite.prepare(`
      INSERT INTO escolas (id, nome_oficial, municipio, cnpj, codigo_inep, situacao, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      escolaId1,
      'Escola Teste 1',
      'Florianópolis',
      '12.345.678/0001-90',
      '42012345',
      'ativa',
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    sqlite.prepare(`
      INSERT INTO escolas (id, nome_oficial, municipio, cnpj, codigo_inep, situacao, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      escolaId2,
      'Escola Teste 2',
      'Blumenau',
      '98.765.432/0001-10',
      '42067890',
      'ativa',
      new Date().toISOString(),
      new Date().toISOString()
    );
  });
  
  afterEach(() => {
    sqlite.exec('DELETE FROM pareceres');
    sqlite.exec('DELETE FROM escolas');
  });
  
  afterAll(() => {
    sqlite.close();
  });
  
  test('deve filtrar pareceres por escola', () => {
    // Criar pareceres
    sqlite.prepare(`
      INSERT INTO pareceres (id, escola_id, numero_parecer, ano_parecer, data_parecer, ementa, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'parecer-001',
      escolaId1,
      1,
      2024,
      '2024-01-15',
      'Ementa teste 1',
      'rascunho',
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    sqlite.prepare(`
      INSERT INTO pareceres (id, escola_id, numero_parecer, ano_parecer, data_parecer, ementa, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'parecer-002',
      escolaId2,
      2,
      2024,
      '2024-02-20',
      'Ementa teste 2',
      'finalizado',
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    // Filtrar por escola
    const pareceres = sqlite.prepare(`
      SELECT p.*, e.nome_oficial, e.municipio
      FROM pareceres p
      INNER JOIN escolas e ON p.escola_id = e.id
      WHERE e.nome_oficial LIKE ?
    `).all('%Escola Teste 1%') as any[];
    
    expect(pareceres.length).toBe(1);
    expect(pareceres[0].id).toBe('parecer-001');
  });
  
  test('deve filtrar pareceres por número e ano', () => {
    sqlite.prepare(`
      INSERT INTO pareceres (id, escola_id, numero_parecer, ano_parecer, data_parecer, ementa, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'parecer-001',
      escolaId1,
      100,
      2024,
      '2024-01-15',
      'Ementa teste',
      'rascunho',
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    sqlite.prepare(`
      INSERT INTO pareceres (id, escola_id, numero_parecer, ano_parecer, data_parecer, ementa, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'parecer-002',
      escolaId1,
      200,
      2023,
      '2023-12-10',
      'Ementa teste 2',
      'finalizado',
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    // Filtrar por número 100 e ano 2024
    const pareceres = sqlite.prepare(`
      SELECT * FROM pareceres
      WHERE numero_parecer = ? AND ano_parecer = ?
    `).all(100, 2024) as any[];
    
    expect(pareceres.length).toBe(1);
    expect(pareceres[0].numero_parecer).toBe(100);
    expect(pareceres[0].ano_parecer).toBe(2024);
  });
  
  test('deve filtrar pareceres por status', () => {
    sqlite.prepare(`
      INSERT INTO pareceres (id, escola_id, numero_parecer, ano_parecer, data_parecer, ementa, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'parecer-001',
      escolaId1,
      1,
      2024,
      '2024-01-15',
      'Ementa rascunho',
      'rascunho',
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    sqlite.prepare(`
      INSERT INTO pareceres (id, escola_id, numero_parecer, ano_parecer, data_parecer, ementa, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'parecer-002',
      escolaId1,
      2,
      2024,
      '2024-02-20',
      'Ementa finalizado',
      'finalizado',
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    // Filtrar apenas rascunhos
    const rascunhos = sqlite.prepare(`
      SELECT * FROM pareceres WHERE status = ?
    `).all('rascunho') as any[];
    
    expect(rascunhos.length).toBe(1);
    expect(rascunhos[0].status).toBe('rascunho');
  });
  
  test('deve filtrar pareceres por intervalo de data', () => {
    sqlite.prepare(`
      INSERT INTO pareceres (id, escola_id, numero_parecer, ano_parecer, data_parecer, ementa, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'parecer-001',
      escolaId1,
      1,
      2024,
      '2024-01-15',
      'Ementa janeiro',
      'rascunho',
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    sqlite.prepare(`
      INSERT INTO pareceres (id, escola_id, numero_parecer, ano_parecer, data_parecer, ementa, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'parecer-002',
      escolaId1,
      2,
      2024,
      '2024-03-20',
      'Ementa março',
      'finalizado',
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    // Filtrar entre 01/02/2024 e 28/02/2024
    const pareceres = sqlite.prepare(`
      SELECT * FROM pareceres
      WHERE data_parecer >= ? AND data_parecer <= ?
    `).all('2024-02-01', '2024-02-28') as any[];
    
    expect(pareceres.length).toBe(0); // Nenhum parecer nesse intervalo
  });
  
  test('deve filtrar pareceres por cidade via dados da escola', () => {
    sqlite.prepare(`
      INSERT INTO pareceres (id, escola_id, numero_parecer, ano_parecer, data_parecer, ementa, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'parecer-001',
      escolaId1, // Florianópolis
      1,
      2024,
      '2024-01-15',
      'Ementa teste',
      'rascunho',
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    sqlite.prepare(`
      INSERT INTO pareceres (id, escola_id, numero_parecer, ano_parecer, data_parecer, ementa, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'parecer-002',
      escolaId2, // Blumenau
      2,
      2024,
      '2024-02-20',
      'Ementa teste 2',
      'finalizado',
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    // Filtrar por cidade Florianópolis
    const pareceres = sqlite.prepare(`
      SELECT p.*, e.municipio
      FROM pareceres p
      INNER JOIN escolas e ON p.escola_id = e.id
      WHERE e.municipio LIKE ?
    `).all('%Florianópolis%') as any[];
    
    expect(pareceres.length).toBe(1);
    expect(pareceres[0].municipio).toBe('Florianópolis');
  });
  
  test('deve filtrar pareceres por CNPJ via dados da escola', () => {
    sqlite.prepare(`
      INSERT INTO pareceres (id, escola_id, numero_parecer, ano_parecer, data_parecer, ementa, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'parecer-001',
      escolaId1,
      1,
      2024,
      '2024-01-15',
      'Ementa teste',
      'rascunho',
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    // Filtrar por CNPJ (com pontos e barras)
    const pareceres = sqlite.prepare(`
      SELECT p.*, e.cnpj
      FROM pareceres p
      INNER JOIN escolas e ON p.escola_id = e.id
      WHERE e.cnpj LIKE ?
    `).all('%12.345%') as any[];
    
    expect(pareceres.length).toBe(1);
    expect(pareceres[0].cnpj).toContain('12.345');
  });
  
  test('deve filtrar pareceres por código INEP via dados da escola', () => {
    sqlite.prepare(`
      INSERT INTO pareceres (id, escola_id, numero_parecer, ano_parecer, data_parecer, ementa, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'parecer-001',
      escolaId1,
      1,
      2024,
      '2024-01-15',
      'Ementa teste',
      'rascunho',
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    // Filtrar por código INEP
    const pareceres = sqlite.prepare(`
      SELECT p.*, e.codigo_inep
      FROM pareceres p
      INNER JOIN escolas e ON p.escola_id = e.id
      WHERE e.codigo_inep LIKE ?
    `).all('%42012345%') as any[];
    
    expect(pareceres.length).toBe(1);
    expect(pareceres[0].codigo_inep).toBe('42012345');
  });
  
  test('deve filtrar pareceres por texto livre na ementa', () => {
    sqlite.prepare(`
      INSERT INTO pareceres (id, escola_id, numero_parecer, ano_parecer, data_parecer, ementa, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'parecer-001',
      escolaId1,
      1,
      2024,
      '2024-01-15',
      'Ementa sobre autorização de curso técnico',
      'rascunho',
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    sqlite.prepare(`
      INSERT INTO pareceres (id, escola_id, numero_parecer, ano_parecer, data_parecer, ementa, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'parecer-002',
      escolaId1,
      2,
      2024,
      '2024-02-20',
      'Ementa sobre renovação de credenciamento',
      'finalizado',
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    // Filtrar por texto "curso técnico"
    const pareceres = sqlite.prepare(`
      SELECT * FROM pareceres
      WHERE ementa LIKE ?
    `).all('%curso técnico%') as any[];
    
    expect(pareceres.length).toBe(1);
    expect(pareceres[0].ementa).toContain('curso técnico');
  });
});
