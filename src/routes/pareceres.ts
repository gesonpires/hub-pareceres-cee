import express from 'express';
import { authenticateToken, requirePerfil } from '../middleware/auth';
import {
  criarParecer,
  listarPareceres,
  obterParecer,
  atualizarParecer,
} from '../controllers/pareceresController';
import { gerarTextoAtosParecer } from '../controllers/geracaoTextoAtosController';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /pareceres - Permitido para todos os perfis autenticados
router.get('/', listarPareceres);

// GET /pareceres/:id - Permitido para todos os perfis autenticados
router.get('/:id', obterParecer);

// POST /pareceres - Apenas perfil edicao
router.post('/', requirePerfil(['edicao']), criarParecer);

// PUT /pareceres/:id - Apenas perfil edicao
router.put('/:id', requirePerfil(['edicao']), atualizarParecer);

// POST /pareceres/:id/gerar-texto-atos - Gerar texto de atos (permitido para todos autenticados)
router.post('/:id/gerar-texto-atos', authenticateToken, gerarTextoAtosParecer);

export default router;
