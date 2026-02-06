import Database from 'better-sqlite3';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const db = new Database(databaseUrl.replace('file:', ''));

// Aplicar migração manualmente: adicionar coluna senha
try {
  console.log('Aplicando migração: adicionar coluna senha...');
  
  // Verificar se a coluna já existe
  const tableInfo = db.prepare("PRAGMA table_info(usuarios)").all() as any[];
  const hasSenhaColumn = tableInfo.some((col: any) => col.name === 'senha');
  
  if (!hasSenhaColumn) {
    // Adicionar coluna senha
    db.exec('ALTER TABLE usuarios ADD COLUMN senha TEXT');
    
    // Atualizar senhas existentes com hash padrão
    const senhaHash = '$2b$10$4vRWVA9J0qiqb.T1XXMKNOQOvEL6bxE1QKGc6bBq7dOLplDulc99C';
    db.prepare('UPDATE usuarios SET senha = ? WHERE senha IS NULL').run(senhaHash);
    
    console.log('✅ Coluna senha adicionada e dados atualizados');
  } else {
    console.log('✅ Coluna senha já existe');
  }
  
  db.close();
} catch (error) {
  console.error('❌ Erro ao aplicar migração:', error);
  db.close();
  process.exit(1);
}
