import { Request, Response } from 'express';
import Database from 'better-sqlite3';
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const sqlite = new Database(databaseUrl.replace('file:', ''));

// Campos obrigatórios conforme modelo de dados
const CAMPOS_OBRIGATORIOS = [
  'tipoAto',
  'numeroAto',
  'dataPublicacao',
  'orgaoEmissor',
  'statusVigencia',
  'observacoes',
];

function validarCamposObrigatorios(dados: any): string[] {
  const camposFaltantes: string[] = [];
  
  CAMPOS_OBRIGATORIOS.forEach(campo => {
    const valor = dados[campo];
    if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
      camposFaltantes.push(campo);
    }
  });
  
  return camposFaltantes;
}

function formatarMensagemErro(camposFaltantes: string[]): string {
  const nomesCampos: { [key: string]: string } = {
    tipoAto: 'Tipo do ato',
    numeroAto: 'Número do ato',
    dataPublicacao: 'Data de publicação',
    orgaoEmissor: 'Órgão emissor',
    statusVigencia: 'Status de vigência',
    observacoes: 'Observações',
  };
  
  const camposFormatados = camposFaltantes.map(campo => nomesCampos[campo] || campo);
  return `Campos obrigatórios não preenchidos: ${camposFormatados.join(', ')}`;
}

export const criarAto = async (req: Request, res: Response) => {
  try {
    const escolaId = req.params.escolaId || req.params.id;
    const {
      tipoAto,
      numeroAto,
      anoAto,
      dataPublicacao,
      orgaoEmissor,
      ementaResumo,
      inicioVigencia,
      fimVigencia,
      statusVigencia,
      observacoes,
    } = req.body;

    // Verificar se escola existe
    const escola = sqlite.prepare('SELECT id FROM escolas WHERE id = ?').get(escolaId) as any;
    if (!escola) {
      return res.status(404).json({ error: 'Escola não encontrada' });
    }

    // Validar campos obrigatórios
    const dados = {
      tipoAto,
      numeroAto,
      dataPublicacao,
      orgaoEmissor,
      statusVigencia,
      observacoes,
    };

    const camposFaltantes = validarCamposObrigatorios(dados);
    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        error: formatarMensagemErro(camposFaltantes),
        camposFaltantes,
      });
    }

    // Validar data
    if (isNaN(new Date(dataPublicacao).getTime())) {
      return res.status(400).json({ error: 'Data de publicação inválida' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    sqlite.prepare(`
      INSERT INTO atos_autorizativos (
        id, escola_id, tipo_ato, numero_ato, ano_ato, data_publicacao,
        orgao_emissor, ementa_resumo, inicio_vigencia, fim_vigencia,
        status_vigencia, observacoes, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      escolaId,
      tipoAto.trim(),
      numeroAto.trim(),
      anoAto || null,
      dataPublicacao,
      orgaoEmissor.trim(),
      ementaResumo || null,
      inicioVigencia || null,
      fimVigencia || null,
      statusVigencia,
      observacoes.trim(),
      now,
      now
    );

    const ato = sqlite.prepare('SELECT * FROM atos_autorizativos WHERE id = ?').get(id) as any;

    res.status(201).json({
      id: ato.id,
      escolaId: ato.escola_id,
      tipoAto: ato.tipo_ato,
      numeroAto: ato.numero_ato,
      anoAto: ato.ano_ato,
      dataPublicacao: ato.data_publicacao,
      orgaoEmissor: ato.orgao_emissor,
      ementaResumo: ato.ementa_resumo,
      inicioVigencia: ato.inicio_vigencia,
      fimVigencia: ato.fim_vigencia,
      statusVigencia: ato.status_vigencia,
      observacoes: ato.observacoes,
      createdAt: ato.created_at,
      updatedAt: ato.updated_at,
    });
  } catch (error) {
    console.error('Erro ao criar ato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const listarAtos = async (req: Request, res: Response) => {
  try {
    const escolaId = req.params.escolaId || req.params.id;

    // Verificar se escola existe
    const escola = sqlite.prepare('SELECT id FROM escolas WHERE id = ?').get(escolaId) as any;
    if (!escola) {
      return res.status(404).json({ error: 'Escola não encontrada' });
    }

    // Ordenar por data_publicacao crescente conforme especificação
    const atos = sqlite.prepare(`
      SELECT * FROM atos_autorizativos 
      WHERE escola_id = ? 
      ORDER BY data_publicacao ASC, numero_ato ASC
    `).all(escolaId) as any[];

    const atosFormatados = atos.map(ato => ({
      id: ato.id,
      escolaId: ato.escola_id,
      tipoAto: ato.tipo_ato,
      numeroAto: ato.numero_ato,
      anoAto: ato.ano_ato,
      dataPublicacao: ato.data_publicacao,
      orgaoEmissor: ato.orgao_emissor,
      ementaResumo: ato.ementa_resumo,
      inicioVigencia: ato.inicio_vigencia,
      fimVigencia: ato.fim_vigencia,
      statusVigencia: ato.status_vigencia,
      observacoes: ato.observacoes,
      createdAt: ato.created_at,
      updatedAt: ato.updated_at,
    }));

    res.json({
      total: atosFormatados.length,
      atos: atosFormatados,
    });
  } catch (error) {
    console.error('Erro ao listar atos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const obterAto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ato = sqlite.prepare('SELECT * FROM atos_autorizativos WHERE id = ?').get(id) as any;

    if (!ato) {
      return res.status(404).json({ error: 'Ato autorizativo não encontrado' });
    }

    res.json({
      id: ato.id,
      escolaId: ato.escola_id,
      tipoAto: ato.tipo_ato,
      numeroAto: ato.numero_ato,
      anoAto: ato.ano_ato,
      dataPublicacao: ato.data_publicacao,
      orgaoEmissor: ato.orgao_emissor,
      ementaResumo: ato.ementa_resumo,
      inicioVigencia: ato.inicio_vigencia,
      fimVigencia: ato.fim_vigencia,
      statusVigencia: ato.status_vigencia,
      observacoes: ato.observacoes,
      createdAt: ato.created_at,
      updatedAt: ato.updated_at,
    });
  } catch (error) {
    console.error('Erro ao obter ato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const atualizarAto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      tipoAto,
      numeroAto,
      anoAto,
      dataPublicacao,
      orgaoEmissor,
      ementaResumo,
      inicioVigencia,
      fimVigencia,
      statusVigencia,
      observacoes,
    } = req.body;

    // Verificar se ato existe
    const atoExistente = sqlite.prepare('SELECT * FROM atos_autorizativos WHERE id = ?').get(id) as any;
    if (!atoExistente) {
      return res.status(404).json({ error: 'Ato autorizativo não encontrado' });
    }

    // Validar campos obrigatórios
    const dados = {
      tipoAto: tipoAto || atoExistente.tipo_ato,
      numeroAto: numeroAto || atoExistente.numero_ato,
      dataPublicacao: dataPublicacao || atoExistente.data_publicacao,
      orgaoEmissor: orgaoEmissor || atoExistente.orgao_emissor,
      statusVigencia: statusVigencia || atoExistente.status_vigencia,
      observacoes: observacoes || atoExistente.observacoes,
    };

    const camposFaltantes = validarCamposObrigatorios(dados);
    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        error: formatarMensagemErro(camposFaltantes),
        camposFaltantes,
      });
    }

    // Validar data se fornecida
    if (dataPublicacao && isNaN(new Date(dataPublicacao).getTime())) {
      return res.status(400).json({ error: 'Data de publicação inválida' });
    }

    const now = new Date().toISOString();

    sqlite.prepare(`
      UPDATE atos_autorizativos 
      SET tipo_ato = ?, numero_ato = ?, ano_ato = ?, data_publicacao = ?,
          orgao_emissor = ?, ementa_resumo = ?, inicio_vigencia = ?, fim_vigencia = ?,
          status_vigencia = ?, observacoes = ?, updated_at = ?
      WHERE id = ?
    `).run(
      tipoAto?.trim() || atoExistente.tipo_ato,
      numeroAto?.trim() || atoExistente.numero_ato,
      anoAto !== undefined ? anoAto : atoExistente.ano_ato,
      dataPublicacao || atoExistente.data_publicacao,
      orgaoEmissor?.trim() || atoExistente.orgao_emissor,
      ementaResumo !== undefined ? ementaResumo : atoExistente.ementa_resumo,
      inicioVigencia !== undefined ? inicioVigencia : atoExistente.inicio_vigencia,
      fimVigencia !== undefined ? fimVigencia : atoExistente.fim_vigencia,
      statusVigencia || atoExistente.status_vigencia,
      observacoes?.trim() || atoExistente.observacoes,
      now,
      id
    );

    const atoAtualizado = sqlite.prepare('SELECT * FROM atos_autorizativos WHERE id = ?').get(id) as any;

    res.json({
      id: atoAtualizado.id,
      escolaId: atoAtualizado.escola_id,
      tipoAto: atoAtualizado.tipo_ato,
      numeroAto: atoAtualizado.numero_ato,
      anoAto: atoAtualizado.ano_ato,
      dataPublicacao: atoAtualizado.data_publicacao,
      orgaoEmissor: atoAtualizado.orgao_emissor,
      ementaResumo: atoAtualizado.ementa_resumo,
      inicioVigencia: atoAtualizado.inicio_vigencia,
      fimVigencia: atoAtualizado.fim_vigencia,
      statusVigencia: atoAtualizado.status_vigencia,
      observacoes: atoAtualizado.observacoes,
      createdAt: atoAtualizado.created_at,
      updatedAt: atoAtualizado.updated_at,
    });
  } catch (error) {
    console.error('Erro ao atualizar ato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const excluirAto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se ato existe
    const ato = sqlite.prepare('SELECT * FROM atos_autorizativos WHERE id = ?').get(id) as any;
    if (!ato) {
      return res.status(404).json({ error: 'Ato autorizativo não encontrado' });
    }

    sqlite.prepare('DELETE FROM atos_autorizativos WHERE id = ?').run(id);

    res.json({ message: 'Ato autorizativo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir ato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
