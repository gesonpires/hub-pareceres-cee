import express from 'express';
import { authenticateToken, requirePerfil } from '../middleware/auth';
import {
  criarEscola,
  listarEscolas,
  obterEscola,
  atualizarEscola,
  desativarEscola,
} from '../controllers/escolasController';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /escolas - Permitido para todos os perfis autenticados
router.get('/', listarEscolas);

// GET /escolas/:id - Permitido para todos os perfis autenticados
router.get('/:id', obterEscola);

// POST /escolas - Apenas perfil edicao
router.post('/', requirePerfil(['edicao']), criarEscola);

// PUT /escolas/:id - Apenas perfil edicao
router.put('/:id', requirePerfil(['edicao']), atualizarEscola);

// PATCH /escolas/:id/desativar - Apenas perfil edicao (desativação lógica)
router.patch('/:id/desativar', requirePerfil(['edicao']), desativarEscola);

export default router;
