import express from 'express';
import { authenticateToken, requirePerfil, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// GET /escolas - Permitido para todos os perfis autenticados
router.get('/', (req: express.Request, res: express.Response) => {
  res.json({ 
    message: 'Lista de escolas (permitido para todos os perfis)',
    user: (req as AuthRequest).user 
  });
});

// POST /escolas - Apenas perfil edicao
router.post('/', requirePerfil(['edicao']), (req: express.Request, res: express.Response) => {
  res.json({ 
    message: 'Escola criada com sucesso',
    user: (req as AuthRequest).user 
  });
});

// PUT /escolas/:id - Apenas perfil edicao
router.put('/:id', requirePerfil(['edicao']), (req: express.Request, res: express.Response) => {
  res.json({ 
    message: `Escola ${req.params.id} atualizada com sucesso`,
    user: (req as AuthRequest).user 
  });
});

// DELETE /escolas/:id - Apenas perfil edicao
router.delete('/:id', requirePerfil(['edicao']), (req: express.Request, res: express.Response) => {
  res.json({ 
    message: `Escola ${req.params.id} excluída com sucesso`,
    user: (req as AuthRequest).user 
  });
});

export default router;
