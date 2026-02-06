import { Request, Response } from 'express';
import Database from 'better-sqlite3';
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const sqlite = new Database(databaseUrl.replace('file:', ''));

export const criarParecer = async (req: Request, res: Response) => {
  try {
    const {
      escolaId,
      numeroParecer,
      anoParecer,
      dataParecer,
      ementa,
      status,
    } = req.body;

    // Validações
    if (!escolaId) {
      return res.status(400).json({ error: 'Escola é obrigatória' });
    }

    if (!numeroParecer || numeroParecer <= 0) {
      return res.status(400).json({ error: 'Número do parecer é obrigatório e deve ser maior que zero' });
    }

    if (!anoParecer || anoParecer <= 0) {
      return res.status(400).json({ error: 'Ano do parecer é obrigatório e deve ser maior que zero' });
    }

    if (!dataParecer) {
      return res.status(400).json({ error: 'Data do parecer é obrigatória' });
    }

    if (!ementa || ementa.trim() === '') {
      return res.status(400).json({ error: 'Ementa é obrigatória' });
    }

    // Verificar se escola existe
    const escola = sqlite.prepare('SELECT id FROM escolas WHERE id = ?').get(escolaId) as any;
    if (!escola) {
      return res.status(404).json({ error: 'Escola não encontrada' });
    }

    // Verificar unicidade (numero_parecer, ano_parecer)
    const existe = sqlite.prepare(
      'SELECT id FROM pareceres WHERE numero_parecer = ? AND ano_parecer = ?'
    ).get(numeroParecer, anoParecer) as any;
    
    if (existe) {
      return res.status(400).json({ 
        error: `Já existe um parecer com número ${numeroParecer} e ano ${anoParecer}` 
      });
    }

    // Validar data
    if (isNaN(new Date(dataParecer).getTime())) {
      return res.status(400).json({ error: 'Data do parecer inválida' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const statusFinal = status || 'rascunho';

    sqlite.prepare(`
      INSERT INTO pareceres (
        id, escola_id, numero_parecer, ano_parecer, data_parecer,
        ementa, texto_atos_gerado, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      escolaId,
      numeroParecer,
      anoParecer,
      dataParecer,
      ementa.trim(),
      null,
      statusFinal,
      now,
      now
    );

    const parecer = sqlite.prepare('SELECT * FROM pareceres WHERE id = ?').get(id) as any;

    res.status(201).json({
      id: parecer.id,
      escolaId: parecer.escola_id,
      numeroParecer: parecer.numero_parecer,
      anoParecer: parecer.ano_parecer,
      dataParecer: parecer.data_parecer,
      ementa: parecer.ementa,
      textoAtosGerado: parecer.texto_atos_gerado,
      status: parecer.status,
      createdAt: parecer.created_at,
      updatedAt: parecer.updated_at,
    });
  } catch (error) {
    console.error('Erro ao criar parecer:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const listarPareceres = async (req: Request, res: Response) => {
  try {
    const { 
      escola, 
      numero, 
      ano, 
      status, 
      dataInicio, 
      dataFim, 
      ementa,
      cidade,
      cnpj,
      inep,
    } = req.query;

    let query = `
      SELECT p.*, e.nome_oficial, e.municipio, e.cnpj, e.codigo_inep
      FROM pareceres p
      INNER JOIN escolas e ON p.escola_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (escola) {
      query += ' AND e.nome_oficial LIKE ?';
      params.push(`%${escola}%`);
    }

    if (numero) {
      query += ' AND p.numero_parecer = ?';
      params.push(parseInt(numero as string));
    }

    if (ano) {
      query += ' AND p.ano_parecer = ?';
      params.push(parseInt(ano as string));
    }

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (dataInicio) {
      query += ' AND p.data_parecer >= ?';
      params.push(dataInicio);
    }

    if (dataFim) {
      query += ' AND p.data_parecer <= ?';
      params.push(dataFim);
    }

    if (ementa) {
      query += ' AND p.ementa LIKE ?';
      params.push(`%${ementa}%`);
    }

    if (cidade) {
      query += ' AND e.municipio LIKE ?';
      params.push(`%${cidade}%`);
    }

    if (cnpj) {
      query += ' AND e.cnpj LIKE ?';
      params.push(`%${cnpj}%`);
    }

    if (inep) {
      query += ' AND e.codigo_inep LIKE ?';
      params.push(`%${inep}%`);
    }

    query += ' ORDER BY p.ano_parecer DESC, p.numero_parecer DESC';

    const pareceres = sqlite.prepare(query).all(...params) as any[];

    const pareceresFormatados = pareceres.map(parecer => ({
      id: parecer.id,
      escolaId: parecer.escola_id,
      numeroParecer: parecer.numero_parecer,
      anoParecer: parecer.ano_parecer,
      dataParecer: parecer.data_parecer,
      ementa: parecer.ementa,
      textoAtosGerado: parecer.texto_atos_gerado,
      status: parecer.status,
      createdAt: parecer.created_at,
      updatedAt: parecer.updated_at,
      escola: {
        nomeOficial: parecer.nome_oficial,
        municipio: parecer.municipio,
        cnpj: parecer.cnpj,
        codigoIneq: parecer.codigo_inep,
      },
    }));

    res.json({
      total: pareceresFormatados.length,
      pareceres: pareceresFormatados,
    });
  } catch (error) {
    console.error('Erro ao listar pareceres:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const obterParecer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const parecer = sqlite.prepare(`
      SELECT p.*, e.nome_oficial, e.municipio, e.cnpj, e.codigo_inep
      FROM pareceres p
      INNER JOIN escolas e ON p.escola_id = e.id
      WHERE p.id = ?
    `).get(id) as any;

    if (!parecer) {
      return res.status(404).json({ error: 'Parecer não encontrado' });
    }

    res.json({
      id: parecer.id,
      escolaId: parecer.escola_id,
      numeroParecer: parecer.numero_parecer,
      anoParecer: parecer.ano_parecer,
      dataParecer: parecer.data_parecer,
      ementa: parecer.ementa,
      textoAtosGerado: parecer.texto_atos_gerado,
      status: parecer.status,
      createdAt: parecer.created_at,
      updatedAt: parecer.updated_at,
      escola: {
        nomeOficial: parecer.nome_oficial,
        municipio: parecer.municipio,
        cnpj: parecer.cnpj,
        codigoIneq: parecer.codigo_inep,
      },
    });
  } catch (error) {
    console.error('Erro ao obter parecer:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const atualizarParecer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      escolaId,
      numeroParecer,
      anoParecer,
      dataParecer,
      ementa,
      status,
    } = req.body;

    // Verificar se parecer existe
    const parecerExistente = sqlite.prepare('SELECT * FROM pareceres WHERE id = ?').get(id) as any;
    if (!parecerExistente) {
      return res.status(404).json({ error: 'Parecer não encontrado' });
    }

    // Validações
    if (escolaId) {
      const escola = sqlite.prepare('SELECT id FROM escolas WHERE id = ?').get(escolaId) as any;
      if (!escola) {
        return res.status(404).json({ error: 'Escola não encontrada' });
      }
    }

    // Verificar unicidade se número ou ano mudaram
    const numeroFinal = numeroParecer || parecerExistente.numero_parecer;
    const anoFinal = anoParecer || parecerExistente.ano_parecer;
    
    if (numeroFinal !== parecerExistente.numero_parecer || anoFinal !== parecerExistente.ano_parecer) {
      const existe = sqlite.prepare(
        'SELECT id FROM pareceres WHERE numero_parecer = ? AND ano_parecer = ? AND id != ?'
      ).get(numeroFinal, anoFinal, id) as any;
      
      if (existe) {
        return res.status(400).json({ 
          error: `Já existe outro parecer com número ${numeroFinal} e ano ${anoFinal}` 
        });
      }
    }

    if (dataParecer && isNaN(new Date(dataParecer).getTime())) {
      return res.status(400).json({ error: 'Data do parecer inválida' });
    }

    if (ementa && ementa.trim() === '') {
      return res.status(400).json({ error: 'Ementa não pode ser vazia' });
    }

    const now = new Date().toISOString();

    sqlite.prepare(`
      UPDATE pareceres 
      SET escola_id = ?, numero_parecer = ?, ano_parecer = ?, data_parecer = ?,
          ementa = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).run(
      escolaId || parecerExistente.escola_id,
      numeroFinal,
      anoFinal,
      dataParecer || parecerExistente.data_parecer,
      ementa?.trim() || parecerExistente.ementa,
      status || parecerExistente.status,
      now,
      id
    );

    const parecerAtualizado = sqlite.prepare(`
      SELECT p.*, e.nome_oficial, e.municipio, e.cnpj, e.codigo_inep
      FROM pareceres p
      INNER JOIN escolas e ON p.escola_id = e.id
      WHERE p.id = ?
    `).get(id) as any;

    res.json({
      id: parecerAtualizado.id,
      escolaId: parecerAtualizado.escola_id,
      numeroParecer: parecerAtualizado.numero_parecer,
      anoParecer: parecerAtualizado.ano_parecer,
      dataParecer: parecerAtualizado.data_parecer,
      ementa: parecerAtualizado.ementa,
      textoAtosGerado: parecerAtualizado.texto_atos_gerado,
      status: parecerAtualizado.status,
      createdAt: parecerAtualizado.created_at,
      updatedAt: parecerAtualizado.updated_at,
      escola: {
        nomeOficial: parecerAtualizado.nome_oficial,
        municipio: parecerAtualizado.municipio,
        cnpj: parecerAtualizado.cnpj,
        codigoIneq: parecerAtualizado.codigo_inep,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar parecer:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
