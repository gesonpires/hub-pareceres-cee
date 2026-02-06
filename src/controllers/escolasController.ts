import { Request, Response } from 'express';
import Database from 'better-sqlite3';
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const sqlite = new Database(databaseUrl.replace('file:', ''));

interface Escola {
  id: string;
  nomeOficial: string;
  codigoIneq?: string | null;
  cnpj?: string | null;
  municipio?: string | null;
  redeEnsino?: string | null;
  situacao: string;
  createdAt: string;
  updatedAt: string;
}

export const criarEscola = async (req: Request, res: Response) => {
  try {
    const { nomeOficial, codigoIneq, cnpj, municipio, redeEnsino, situacao } = req.body;

    // Validações
    if (!nomeOficial || nomeOficial.trim() === '') {
      return res.status(400).json({ error: 'Nome oficial é obrigatório' });
    }

    // Verificar se código INEP já existe (se fornecido)
    if (codigoIneq) {
      const existe = sqlite.prepare('SELECT id FROM escolas WHERE codigo_inep = ?').get(codigoIneq);
      if (existe) {
        return res.status(400).json({ error: 'Código INEP já cadastrado' });
      }
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const situacaoFinal = situacao || 'ativa';

    sqlite.prepare(`
      INSERT INTO escolas (id, nome_oficial, codigo_inep, cnpj, municipio, rede_ensino, situacao, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      nomeOficial.trim(),
      codigoIneq || null,
      cnpj || null,
      municipio || null,
      redeEnsino || null,
      situacaoFinal,
      now,
      now
    );

    const escola = sqlite.prepare('SELECT * FROM escolas WHERE id = ?').get(id) as any;

    res.status(201).json({
      id: escola.id,
      nomeOficial: escola.nome_oficial,
      codigoIneq: escola.codigo_inep,
      cnpj: escola.cnpj,
      municipio: escola.municipio,
      redeEnsino: escola.rede_ensino,
      situacao: escola.situacao,
      createdAt: escola.created_at,
      updatedAt: escola.updated_at,
    });
  } catch (error) {
    console.error('Erro ao criar escola:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const listarEscolas = async (req: Request, res: Response) => {
  try {
    const { nome, cidade, cnpj, inep, situacao } = req.query;

    let query = 'SELECT * FROM escolas WHERE 1=1';
    const params: any[] = [];

    if (nome) {
      query += ' AND nome_oficial LIKE ?';
      params.push(`%${nome}%`);
    }

    if (cidade) {
      query += ' AND municipio LIKE ?';
      params.push(`%${cidade}%`);
    }

    if (cnpj) {
      query += ' AND cnpj LIKE ?';
      params.push(`%${cnpj}%`);
    }

    if (inep) {
      query += ' AND codigo_inep LIKE ?';
      params.push(`%${inep}%`);
    }

    if (situacao) {
      query += ' AND situacao = ?';
      params.push(situacao);
    }

    query += ' ORDER BY nome_oficial ASC';

    const escolas = sqlite.prepare(query).all(...params) as any[];

    const escolasFormatadas = escolas.map(escola => ({
      id: escola.id,
      nomeOficial: escola.nome_oficial,
      codigoIneq: escola.codigo_inep,
      cnpj: escola.cnpj,
      municipio: escola.municipio,
      redeEnsino: escola.rede_ensino,
      situacao: escola.situacao,
      createdAt: escola.created_at,
      updatedAt: escola.updated_at,
    }));

    res.json({
      total: escolasFormatadas.length,
      escolas: escolasFormatadas,
    });
  } catch (error) {
    console.error('Erro ao listar escolas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const obterEscola = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const escola = sqlite.prepare('SELECT * FROM escolas WHERE id = ?').get(id) as any;

    if (!escola) {
      return res.status(404).json({ error: 'Escola não encontrada' });
    }

    res.json({
      id: escola.id,
      nomeOficial: escola.nome_oficial,
      codigoIneq: escola.codigo_inep,
      cnpj: escola.cnpj,
      municipio: escola.municipio,
      redeEnsino: escola.rede_ensino,
      situacao: escola.situacao,
      createdAt: escola.created_at,
      updatedAt: escola.updated_at,
    });
  } catch (error) {
    console.error('Erro ao obter escola:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const atualizarEscola = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nomeOficial, codigoIneq, cnpj, municipio, redeEnsino, situacao } = req.body;

    // Verificar se escola existe
    const escolaExistente = sqlite.prepare('SELECT * FROM escolas WHERE id = ?').get(id) as any;
    if (!escolaExistente) {
      return res.status(404).json({ error: 'Escola não encontrada' });
    }

    // Validações
    if (!nomeOficial || nomeOficial.trim() === '') {
      return res.status(400).json({ error: 'Nome oficial é obrigatório' });
    }

    // Verificar se código INEP já existe em outra escola (se fornecido e diferente do atual)
    if (codigoIneq && codigoIneq !== escolaExistente.codigo_inep) {
      const existe = sqlite.prepare('SELECT id FROM escolas WHERE codigo_inep = ? AND id != ?').get(codigoIneq, id);
      if (existe) {
        return res.status(400).json({ error: 'Código INEP já cadastrado em outra escola' });
      }
    }

    const now = new Date().toISOString();

    sqlite.prepare(`
      UPDATE escolas 
      SET nome_oficial = ?, codigo_inep = ?, cnpj = ?, municipio = ?, rede_ensino = ?, situacao = ?, updated_at = ?
      WHERE id = ?
    `).run(
      nomeOficial.trim(),
      codigoIneq || null,
      cnpj || null,
      municipio || null,
      redeEnsino || null,
      situacao || escolaExistente.situacao,
      now,
      id
    );

    const escolaAtualizada = sqlite.prepare('SELECT * FROM escolas WHERE id = ?').get(id) as any;

    res.json({
      id: escolaAtualizada.id,
      nomeOficial: escolaAtualizada.nome_oficial,
      codigoIneq: escolaAtualizada.codigo_inep,
      cnpj: escolaAtualizada.cnpj,
      municipio: escolaAtualizada.municipio,
      redeEnsino: escolaAtualizada.rede_ensino,
      situacao: escolaAtualizada.situacao,
      createdAt: escolaAtualizada.created_at,
      updatedAt: escolaAtualizada.updated_at,
    });
  } catch (error) {
    console.error('Erro ao atualizar escola:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const desativarEscola = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se escola existe
    const escola = sqlite.prepare('SELECT * FROM escolas WHERE id = ?').get(id) as any;
    if (!escola) {
      return res.status(404).json({ error: 'Escola não encontrada' });
    }

    const now = new Date().toISOString();

    sqlite.prepare('UPDATE escolas SET situacao = ?, updated_at = ? WHERE id = ?').run('inativa', now, id);

    const escolaAtualizada = sqlite.prepare('SELECT * FROM escolas WHERE id = ?').get(id) as any;

    res.json({
      id: escolaAtualizada.id,
      nomeOficial: escolaAtualizada.nome_oficial,
      codigoIneq: escolaAtualizada.codigo_inep,
      cnpj: escolaAtualizada.cnpj,
      municipio: escolaAtualizada.municipio,
      redeEnsino: escolaAtualizada.rede_ensino,
      situacao: escolaAtualizada.situacao,
      createdAt: escolaAtualizada.created_at,
      updatedAt: escolaAtualizada.updated_at,
    });
  } catch (error) {
    console.error('Erro ao desativar escola:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
