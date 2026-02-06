import express from 'express';
import { authenticateToken, requirePerfil } from '../middleware/auth';
import {
  criarAto,
  listarAtos,
  obterAto,
  atualizarAto,
  excluirAto,
} from '../controllers/atosController';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /atos/:id - Permitido para todos os perfis autenticados
router.get('/:id', obterAto);

// PUT /atos/:id - Apenas perfil edicao
router.put('/:id', requirePerfil(['edicao']), atualizarAto);

// DELETE /atos/:id - Apenas perfil edicao
router.delete('/:id', requirePerfil(['edicao']), excluirAto);

export default router;
