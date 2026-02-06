import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const sqlite = new Database(databaseUrl.replace('file:', ''));

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-desenvolvimento-mvp';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }

    // Buscar usuário no banco usando SQL direto (mais confiável para MVP)
    const user = sqlite.prepare(
      'SELECT id, nome, email, senha, perfil, ativo FROM usuarios WHERE email = ? AND ativo = 1'
    ).get(email) as any;

    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas' 
      });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas' 
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        perfil: user.perfil 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // O middleware authenticateToken já adiciona req.user
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const user = sqlite.prepare(
      'SELECT id, nome, email, perfil, ativo FROM usuarios WHERE id = ?'
    ).get(userId) as any;

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.perfil,
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
