const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const serverless = require('serverless-http');

// Importar sistema de atualização automática da campanha
const { startAutoAdvanceCampaign } = require('./auto-advance-campaign');

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const questionRoutes = require('./routes/questions');
const rankingRoutes = require('./routes/ranking');
const campanhaRoutes = require('./routes/campanha');

const app = express();

// Configurações de segurança
app.use(helmet());

// Configuração do CORS - permitir todas as origens
app.use(cors({
  origin: true,
  credentials: true
}));

// Rate limiting baseado em usuário
const userRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000,
  message: 'Muitas requisições deste usuário, tente novamente mais tarde.',
  keyGenerator: (req) => {
    if (req.user && req.user.id) {
      return req.user.id;
    }
    return req.ip;
  },
  skip: (req) => {
    const publicRoutes = ['/api/auth/login', '/api/test'];
    return publicRoutes.some(route => req.path.includes(route));
  }
});

// Middleware para parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de autenticação + rate limiting
const authenticatedRateLimit = (rateLimitMiddleware) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(
          token, 
          process.env.JWT_SECRET || 'ga_quiz_secret_key_2024_bahia_education'
        );
        req.user = decoded;
      } catch (error) {
        console.log('⚠️ Token inválido no rate limiting, usando IP como fallback');
      }
    }
    
    rateLimitMiddleware(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  };
};

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticatedRateLimit(userRateLimit), userRoutes);
app.use('/api/questions', authenticatedRateLimit(userRateLimit), questionRoutes);
app.use('/api/ranking', authenticatedRateLimit(userRateLimit), rankingRoutes);
app.use('/api/campanha', authenticatedRateLimit(userRateLimit), campanhaRoutes);

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'GA Quiz API Serverless está funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na API:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
  });
});

// Rota para health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Exportar para serverless
module.exports.handler = serverless(app);

// Para desenvolvimento local
if (process.env.IS_OFFLINE) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🧪 Teste da API: http://localhost:${PORT}/api/test`);
  });
}

