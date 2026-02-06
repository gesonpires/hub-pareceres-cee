import { Request, Response } from 'express';
import Database from 'better-sqlite3';
import 'dotenv/config';
import { validarAtosEscola, gerarTextoAtos } from '../services/geracaoTextoAtos';

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const sqlite = new Database(databaseUrl.replace('file:', ''));

export const gerarTextoAtosParecer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { escolaId } = req.body;
    
    // Verificar se parecer existe
    const parecer = sqlite.prepare('SELECT * FROM pareceres WHERE id = ?').get(id) as any;
    if (!parecer) {
      return res.status(404).json({ error: 'Parecer não encontrado' });
    }
    
    // Usar escolaId do body ou do parecer
    const escolaIdFinal = escolaId || parecer.escola_id;
    
    if (!escolaIdFinal) {
      return res.status(400).json({
        bloqueado: true,
        error: 'Não é possível gerar o texto "ATOS AUTORIZATIVOS"',
        mensagem: 'O parecer não possui uma escola vinculada. Por favor, selecione uma escola antes de gerar o texto.',
      });
    }
    
    // Validar atos da escola
    const validacao = validarAtosEscola(escolaIdFinal);
    
    if (!validacao.valido) {
      return res.status(400).json({
        bloqueado: true,
        error: 'Não é possível gerar o texto "ATOS AUTORIZATIVOS"',
        mensagem: validacao.mensagem,
        atosIncompletos: validacao.atosIncompletos,
      });
    }
    
    // Gerar texto
    const textoGerado = gerarTextoAtos(escolaIdFinal);
    
    // Salvar snapshot no parecer
    const now = new Date().toISOString();
    sqlite.prepare(`
      UPDATE pareceres 
      SET texto_atos_gerado = ?, updated_at = ?
      WHERE id = ?
    `).run(textoGerado, now, id);
    
    res.json({
      sucesso: true,
      textoGerado,
      mensagem: 'Texto gerado com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao gerar texto de atos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
