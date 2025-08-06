const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importar sistema de atualização automática da campanha
const { startAutoAdvanceCampaign } = require('./auto-advance-campaign');

// Importar rotas
const authRoutes = require('./routes/auth-firebase');
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requests por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/campanha', campanhaRoutes);

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