import { Router } from 'express';
import {
  uploadArquivos,
  obterPreview,
  confirmarImportacao,
  buscarEscolas
} from '../controllers/importacaoController';
import { authenticateToken } from '../middleware/auth';
import { requirePerfil } from '../middleware/auth';

const router = Router();

// Todas as rotas de importação requerem autenticação e perfil de edição
router.use(authenticateToken);
router.use(requirePerfil('edicao'));

// Upload e processamento de arquivos
router.post('/upload', uploadArquivos);

// Obter preview de arquivo processado
router.get('/preview/:id', obterPreview);

// Confirmar importação após revisão
router.post('/confirmar/:id', confirmarImportacao);

// Buscar escolas para sugestão
router.get('/buscar-escolas', buscarEscolas);

export default router;
