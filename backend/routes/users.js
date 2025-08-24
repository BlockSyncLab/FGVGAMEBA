const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  user: config.DB_USER,
  host: config.DB_HOST,
  database: config.DB_NAME,
  password: config.DB_PASSWORD,
  port: config.DB_PORT || 5432,
  ssl: config.DB_SSL ? { rejectUnauthorized: false } : false,
});

const router = express.Router();

// Funções PostgreSQL para substituir Firebase
async function getUsers() {
  const result = await pool.query('SELECT * FROM users ORDER BY id');
  return result.rows;
}

async function getUserById(userId) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0] || null;
}

async function getCampanhaConfig() {
  const result = await pool.query('SELECT * FROM campanha_config WHERE ativa = true ORDER BY id DESC LIMIT 1');
  return result.rows[0] || null;
}

// Função para calcular o dia atual baseado na data real
async function getCurrentDay() {
  try {
    const config = await getCampanhaConfig();
    
    if (!config) {
      console.log('⚠️ Nenhuma campanha ativa encontrada, usando dia 1 como padrão');
      return 1;
    }
    
    const dataInicio = new Date(config.data_inicio);
    const dataAtual = new Date();
    
    // Calcular diferença em dias
    const diffTime = dataAtual.getTime() - dataInicio.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Se ainda não começou a campanha
    if (diffDays < 0) {
      console.log('📅 Campanha ainda não começou');
      return 0;
    }
    
    // Se a campanha já terminou
    if (diffDays >= config.duracao_dias) {
      console.log('📅 Campanha já terminou');
      return config.duracao_dias;
    }
    
    // Dia atual da campanha (1-based)
    const currentDay = diffDays + 1;
    
    // Se estamos no primeiro dia da campanha, forçar dia 1
    if (diffDays === 0) {
      console.log('📅 Primeiro dia da campanha: forçando dia 1');
      return 1;
    }
    
    console.log(`📅 Dia atual da campanha: ${currentDay} (${config.duracao_dias} dias total)`);
    
    return currentDay;
  } catch (error) {
    console.error('Erro ao calcular dia atual:', error);
    return 1; // Fallback
  }
}

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      error: 'Token não fornecido',
      message: 'Token de autenticação é obrigatório'
    });
  }

  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'ga_quiz_secret_key_2024_bahia_education'
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'Token de autenticação inválido ou expirado'
    });
  }
};

// Rota para obter dados da turma do usuário
router.get('/turma', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar dados do usuário
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não existe'
      });
    }

    // Buscar todos os usuários
    const allUsers = await getUsers();

    // Filtrar usuários da mesma turma
    const turmaUsers = allUsers.filter(u => 
      u.turma === user.turma && u.escola === user.escola
    ).sort((a, b) => (b.xp_atual || 0) - (a.xp_atual || 0));

    // Obter dia atual
    const currentDay = await getCurrentDay();
    
    // Calcular estatísticas da turma
    const totalUsers = turmaUsers.length;
    const totalXp = turmaUsers.reduce((sum, u) => sum + (u.xp_atual || 0), 0);
    const mediaXp = totalUsers > 0 ? Math.round(totalXp / totalUsers) : 0;
    
    // Calcular média de participação baseada no dia atual
    let totalParticipacao = 0;
    turmaUsers.forEach(u => {
      let participacao = 0;
      if (currentDay >= 1) participacao += (u.response_q1 ? 1 : 0);
      if (currentDay >= 2) participacao += (u.response_q2 ? 1 : 0);
      if (currentDay >= 3) participacao += (u.response_q3 ? 1 : 0);
      if (currentDay >= 4) participacao += (u.response_q4 ? 1 : 0);
      totalParticipacao += participacao;
    });
    const mediaParticipacao = totalUsers > 0 && currentDay > 0 ? 
      Math.round((totalParticipacao / (totalUsers * currentDay)) * 100) : 0;

    // Adicionar posição e dados de participação para cada usuário
    const turmaCompleta = turmaUsers.map((u, index) => {
      let participacao = 0;
      if (currentDay >= 1) participacao += (u.response_q1 ? 1 : 0);
      if (currentDay >= 2) participacao += (u.response_q2 ? 1 : 0);
      if (currentDay >= 3) participacao += (u.response_q3 ? 1 : 0);
      if (currentDay >= 4) participacao += (u.response_q4 ? 1 : 0);

      return {
        id: u.id,
        login: u.login,
        xp_atual: u.xp_atual || 0,
        erros: u.erros || 0,
        response_q1: u.response_q1 || false,
        response_q2: u.response_q2 || false,
        response_q3: u.response_q3 || false,
        response_q4: u.response_q4 || false,
        posicao: index + 1,
        desafiosFeitos: participacao,
        mediaParticipacao: participacao
      };
    });

    res.json({
      success: true,
      turma: {
        nome: user.turma,
        escola: user.escola,
        totalEstudantes: totalUsers,
        mediaXp: mediaXp,
        mediaParticipacao: mediaParticipacao,
        estudantes: turmaCompleta
      }
    });

  } catch (error) {
    console.error('Erro ao buscar dados da turma:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar dados da turma'
    });
  }
});

// Rota para obter dados do usuário atual
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar dados do usuário
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não existe'
      });
    }

    // Obter dia atual
    const currentDay = await getCurrentDay();
    
    // Calcular nível baseado no XP
            const nivel = Math.floor((user.xp_atual || 0) / 100) + 1;
    
    // Calcular XP para próximo nível
    const xpAtual = (user.xp_atual || 0) % 500;
    const xpParaProxNivel = 500 - xpAtual;

    // Contar perguntas respondidas baseado no dia atual
    let perguntasRespondidas = 0;
    if (currentDay >= 1 && user.response_q1) perguntasRespondidas++;
    if (currentDay >= 2 && user.response_q2) perguntasRespondidas++;
    if (currentDay >= 3 && user.response_q3) perguntasRespondidas++;
    if (currentDay >= 4 && user.response_q4) perguntasRespondidas++;

    res.json({
      success: true,
      user: {
        id: user.id,
        login: user.login,
        turma: user.turma,
        escola: user.escola,
        xp_atual: user.xp_atual || 0,
        erros: user.erros || 0,
        nivel: nivel,
        xpParaProxNivel: xpParaProxNivel,
        perguntasRespondidas: perguntasRespondidas,
        id_q1: user.id_q1,
        response_q1: user.response_q1 || false,
        id_q2: user.id_q2,
        response_q2: user.response_q2 || false,
        id_q3: user.id_q3,
        response_q3: user.response_q3 || false,
        id_q4: user.id_q4,
        response_q4: user.response_q4 || false
      }
    });

  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar perfil do usuário'
    });
  }
});

module.exports = router; 