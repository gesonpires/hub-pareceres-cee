import { Request, Response } from 'express';
import multer from 'multer';
import { processarArquivo } from '../services/importacao/importadorPareceres';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const sqlite = new Database(databaseUrl.replace('file:', ''));

// Configurar multer para armazenar arquivos em memória
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.pdf') || file.originalname.toLowerCase().endsWith('.docx')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF e DOCX são permitidos'));
    }
  }
});

// Armazenamento temporário dos arquivos processados (em produção, usar Redis ou banco)
const arquivosProcessados = new Map<string, any>();

/**
 * Upload e processamento de arquivos
 */
export const uploadArquivos = [
  upload.array('arquivos', 10), // Máximo 10 arquivos por vez
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const resultados = await Promise.all(
        files.map(async (file) => {
          const id = uuidv4();
          const resultado = await processarArquivo(file.buffer, file.originalname);
          
          // Garantir que textoExtraido seja string antes de armazenar
          let textoExtraidoString = '';
          console.log(`[DEBUG] Tipo de textoExtraido: ${typeof resultado.textoExtraido}`);
          console.log(`[DEBUG] É string? ${typeof resultado.textoExtraido === 'string'}`);
          console.log(`[DEBUG] É Promise? ${resultado.textoExtraido && typeof resultado.textoExtraido.then === 'function'}`);
          console.log(`[DEBUG] É objeto? ${resultado.textoExtraido && typeof resultado.textoExtraido === 'object'}`);
          
          if (typeof resultado.textoExtraido === 'string') {
            textoExtraidoString = resultado.textoExtraido;
            console.log(`[DEBUG] Texto extraído (primeiros 100 chars): ${textoExtraidoString.substring(0, 100)}`);
          } else if (resultado.textoExtraido && typeof resultado.textoExtraido.then === 'function') {
            // Se for Promise, aguardar (não deveria acontecer)
            console.error('textoExtraido é uma Promise no resultado!');
            textoExtraidoString = await resultado.textoExtraido;
            // Garantir que ainda é string após await
            if (typeof textoExtraidoString !== 'string') {
              textoExtraidoString = String(textoExtraidoString || '');
            }
          } else if (resultado.textoExtraido && typeof resultado.textoExtraido === 'object') {
            // Se for objeto, tentar converter
            console.warn('textoExtraido é um objeto no resultado! Tentando converter...', Object.keys(resultado.textoExtraido));
            try {
              textoExtraidoString = JSON.stringify(resultado.textoExtraido);
            } catch (e) {
              textoExtraidoString = String(resultado.textoExtraido || '');
            }
          } else {
            textoExtraidoString = String(resultado.textoExtraido || '');
          }
          
          console.log(`[DEBUG] Texto final (tipo: ${typeof textoExtraidoString}, tamanho: ${textoExtraidoString.length})`);
          
          // Criar objeto limpo para armazenar (sem spread para evitar problemas)
          const arquivoProcessado: any = {
            id: id,
            nomeArquivo: resultado.nomeArquivo,
            tipo: resultado.tipo,
            textoExtraido: textoExtraidoString,
            dadosSugeridos: resultado.dadosSugeridos,
            erro: resultado.erro,
            uploadedAt: new Date().toISOString()
          };
          
          // Verificar antes de armazenar
          console.log(`[DEBUG] Antes de armazenar - tipo textoExtraido: ${typeof arquivoProcessado.textoExtraido}`);
          arquivosProcessados.set(id, arquivoProcessado);
          
          // Verificar após armazenar
          const arquivoArmazenado = arquivosProcessados.get(id);
          console.log(`[DEBUG] Após armazenar - tipo textoExtraido: ${typeof arquivoArmazenado?.textoExtraido}`);

          return {
            id,
            nomeArquivo: resultado.nomeArquivo,
            tipo: resultado.tipo,
            temErro: !!resultado.erro,
            erro: resultado.erro,
            dadosSugeridos: resultado.dadosSugeridos
          };
        })
      );

      res.json({ arquivos: resultados });
    } catch (error: any) {
      console.error('Erro ao processar upload:', error);
      res.status(500).json({ error: error.message || 'Erro ao processar arquivos' });
    }
  }
];

/**
 * Obter preview de um arquivo processado
 */
export const obterPreview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const arquivo = arquivosProcessados.get(id);
    if (!arquivo) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    // Garantir que textoExtraido seja string e não uma Promise ou objeto
    console.log(`[DEBUG PREVIEW] Tipo de arquivo.textoExtraido: ${typeof arquivo.textoExtraido}`);
    console.log(`[DEBUG PREVIEW] É string? ${typeof arquivo.textoExtraido === 'string'}`);
    console.log(`[DEBUG PREVIEW] É objeto? ${arquivo.textoExtraido && typeof arquivo.textoExtraido === 'object'}`);
    
    let textoExtraidoString = '';
    if (typeof arquivo.textoExtraido === 'string') {
      textoExtraidoString = arquivo.textoExtraido;
      console.log(`[DEBUG PREVIEW] Texto extraído (primeiros 100 chars): ${textoExtraidoString.substring(0, 100)}`);
    } else if (arquivo.textoExtraido && typeof arquivo.textoExtraido.then === 'function') {
      // Se for uma Promise, isso é um erro - não deveria acontecer
      console.error('textoExtraido é uma Promise! Isso não deveria acontecer.');
      textoExtraidoString = '';
    } else if (arquivo.textoExtraido && typeof arquivo.textoExtraido === 'object') {
      // Se for objeto, tentar converter
      console.warn('textoExtraido é um objeto! Tentando converter...', Object.keys(arquivo.textoExtraido));
      try {
        textoExtraidoString = JSON.stringify(arquivo.textoExtraido);
      } catch (e) {
        textoExtraidoString = String(arquivo.textoExtraido || '');
      }
    } else {
      textoExtraidoString = String(arquivo.textoExtraido || '');
    }
    
    console.log(`[DEBUG PREVIEW] Texto final (tipo: ${typeof textoExtraidoString}, tamanho: ${textoExtraidoString.length})`);
    
    // Criar objeto novo para garantir serialização correta
    const arquivoSerializado = {
      id: arquivo.id,
      nomeArquivo: arquivo.nomeArquivo,
      tipo: arquivo.tipo,
      textoExtraido: textoExtraidoString,
      dadosSugeridos: arquivo.dadosSugeridos,
      erro: arquivo.erro,
      uploadedAt: arquivo.uploadedAt
    };
    
    console.log(`[DEBUG PREVIEW] Antes de enviar - tipo textoExtraido: ${typeof arquivoSerializado.textoExtraido}`);

    res.json(arquivoSerializado);
  } catch (error: any) {
    console.error('Erro ao obter preview:', error);
    res.status(500).json({ error: error.message || 'Erro ao obter preview' });
  }
};

/**
 * Confirmar importação de um parecer após revisão
 */
export const confirmarImportacao = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      escolaId,
      numeroParecer,
      anoParecer,
      dataParecer,
      ementa,
      status
    } = req.body;

    // Validar campos obrigatórios
    if (!escolaId || !numeroParecer || !anoParecer || !dataParecer || !ementa) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios faltando',
        camposFaltantes: {
          escolaId: !escolaId,
          numeroParecer: !numeroParecer,
          anoParecer: !anoParecer,
          dataParecer: !dataParecer,
          ementa: !ementa
        }
      });
    }

    // Verificar se escola existe
    const escola = sqlite.prepare('SELECT id FROM escolas WHERE id = ?').get(escolaId);
    if (!escola) {
      return res.status(404).json({ error: 'Escola não encontrada' });
    }

    // Verificar unicidade (numeroParecer + anoParecer)
    const parecerExistente = sqlite.prepare(
      'SELECT id FROM pareceres WHERE numero_parecer = ? AND ano_parecer = ?'
    ).get(numeroParecer, anoParecer);

    if (parecerExistente) {
      return res.status(409).json({ 
        error: 'Já existe um parecer com este número e ano',
        parecerExistente: parecerExistente
      });
    }

    // Inserir parecer
    const parecerId = uuidv4();
    const now = new Date().toISOString();
    const statusFinal = status || 'rascunho';

    sqlite.prepare(`
      INSERT INTO pareceres (
        id, escola_id, numero_parecer, ano_parecer, data_parecer,
        ementa, texto_atos_gerado, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      parecerId,
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

    // Remover arquivo processado do cache
    arquivosProcessados.delete(id);

    const parecer = sqlite.prepare('SELECT * FROM pareceres WHERE id = ?').get(parecerId) as any;

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
      updatedAt: parecer.updated_at
    });
  } catch (error: any) {
    console.error('Erro ao confirmar importação:', error);
    res.status(500).json({ error: error.message || 'Erro ao importar parecer' });
  }
};

/**
 * Buscar escolas por nome (para sugestão)
 */
export const buscarEscolas = async (req: Request, res: Response) => {
  try {
    const { nome } = req.query;
    
    if (!nome || typeof nome !== 'string') {
      return res.status(400).json({ error: 'Parâmetro "nome" é obrigatório' });
    }

    const escolas = sqlite.prepare(`
      SELECT id, nome_oficial, codigo_inep, cnpj, municipio
      FROM escolas
      WHERE nome_oficial LIKE ? OR municipio LIKE ?
      ORDER BY nome_oficial
      LIMIT 20
    `).all(`%${nome}%`, `%${nome}%`) as any[];

    res.json({
      escolas: escolas.map(escola => ({
        id: escola.id,
        nomeOficial: escola.nome_oficial,
        codigoIneq: escola.codigo_inep,
        cnpj: escola.cnpj,
        municipio: escola.municipio
      }))
    });
  } catch (error: any) {
    console.error('Erro ao buscar escolas:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar escolas' });
  }
};
