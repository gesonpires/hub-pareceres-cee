import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-desenvolvimento-mvp';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    perfil: string;
  };
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as AuthRequest).user = {
      id: decoded.id,
      email: decoded.email,
      perfil: decoded.perfil,
    };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

export const requirePerfil = (perfisPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;

    if (!user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!perfisPermitidos.includes(user.perfil)) {
      // Redirecionar para página 403 ou retornar JSON
      const acceptHeader = req.headers.accept || '';
      if (acceptHeader.includes('text/html')) {
        return res.redirect(`/403?perfilRequerido=${perfisPermitidos.join(',')}&perfilAtual=${user.perfil}`);
      }
      
      return res.status(403).json({ 
        error: 'Acesso negado. Perfil insuficiente.',
        perfilRequerido: perfisPermitidos,
        perfilAtual: user.perfil,
        message: `Esta operação requer perfil: ${perfisPermitidos.join(' ou ')}. Seu perfil atual: ${user.perfil}`,
      });
    }

    next();
  };
};
