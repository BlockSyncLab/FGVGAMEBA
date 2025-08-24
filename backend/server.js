const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

// Importar sistema de atualização automática da campanha
const { startAutoAdvanceCampaign } = require('./auto-advance-campaign');

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const questionRoutes = require('./routes/questions');
const rankingRoutes = require('./routes/ranking');
const campanhaRoutes = require('./routes/campanha');

const app = express();

// Configurar trust proxy para funcionar com load balancers/proxies
app.set('trust proxy', 1);

// Configurações de segurança
app.use(helmet());

// Configuração do CORS - permitir todas as origens
app.use(cors({
  origin: true,
  credentials: true
}));

// Rate limiting baseado em usuário (não IP) para permitir competição entre usuários do mesmo IP
const userRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // limite de 1000 requests por usuário
  message: 'Muitas requisições deste usuário, tente novamente mais tarde.',
  keyGenerator: (req) => {
    // Se o usuário estiver autenticado, usar o ID do usuário
    if (req.user && req.user.id) {
      return req.user.id;
    }
    // Se não estiver autenticado, usar o IP como fallback
    return req.ip;
  },
  skip: (req) => {
    // Pular rate limiting para rotas que não precisam de autenticação
    const publicRoutes = ['/api/auth/login', '/api/test'];
    return publicRoutes.some(route => req.path.includes(route));
  }
});

// Middleware para parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware personalizado que combina autenticação + rate limiting baseado no usuário
const authenticatedRateLimit = (rateLimitMiddleware) => {
  return (req, res, next) => {
    // Primeiro verificar se o usuário está autenticado
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(
          token, 
          process.env.JWT_SECRET || 'ga_quiz_secret_key_2024_bahia_education'
        );
        req.user = decoded;
      } catch (error) {
        // Se o token for inválido, continuar sem autenticação
        console.log('⚠️ Token inválido no rate limiting, usando IP como fallback');
      }
    }
    
    // Aplicar rate limiting baseado no usuário (ou IP se não autenticado)
    rateLimitMiddleware(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  };
};

// Rotas da API com rate limiting baseado no usuário
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticatedRateLimit(userRateLimit), userRoutes);
app.use('/api/questions', authenticatedRateLimit(userRateLimit), questionRoutes);
app.use('/api/ranking', authenticatedRateLimit(userRateLimit), rankingRoutes);
app.use('/api/campanha', authenticatedRateLimit(userRateLimit), campanhaRoutes);

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'GA Quiz API está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// Rota para arquivos não encontrados
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    message: 'A rota solicitada não existe' 
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor GA Quiz rodando na porta ${PORT}`);
  console.log(`📊 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🧪 Teste a API em: http://localhost:${PORT}/api/test`);
  
  // Iniciar sistema de atualização automática da campanha
  console.log('🔄 Iniciando sistema de atualização automática da campanha...');
  startAutoAdvanceCampaign();
});

module.exports = app; 