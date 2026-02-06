import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import escolasRoutes from './routes/escolas';
import atosRoutes from './routes/atos';
import pareceresRoutes from './routes/pareceres';
import importacaoRoutes from './routes/importacao';
import { authenticateToken, requirePerfil } from './middleware/auth';
import { listarAtos, criarAto } from './controllers/atosController';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (página 403)
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/escolas', escolasRoutes);
app.use('/api/atos', atosRoutes);
app.use('/api/pareceres', pareceresRoutes);
app.use('/api/importacao', importacaoRoutes);

// Rotas de atos vinculadas a escolas
app.get('/api/escolas/:escolaId/atos', authenticateToken, listarAtos);
app.post('/api/escolas/:escolaId/atos', authenticateToken, requirePerfil(['edicao']), criarAto);

// Rotas de páginas
app.get('/403', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/403.html'));
});

app.get('/escolas.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/escolas.html'));
});

app.get('/escola-form.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/escola-form.html'));
});

app.get('/escola-detalhe.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/escola-detalhe.html'));
});

app.get('/ato-form.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/ato-form.html'));
});

app.get('/pareceres.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pareceres.html'));
});

app.get('/parecer-form.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/parecer-form.html'));
});

app.get('/parecer-view.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/parecer-view.html'));
});

app.get('/importar-pareceres.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/importar-pareceres.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API está funcionando' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

export default app;
