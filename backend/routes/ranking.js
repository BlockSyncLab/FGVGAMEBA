const express = require('express');
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

// Rota para obter ranking de turmas
router.get('/turmas', async (req, res) => {
  try {
    // Obter dia atual
    const currentDay = await getCurrentDay();
    
    // Buscar todos os usuários
    const users = await getUsers();

    // Agrupar por turma e calcular médias
    const turmasMap = {};
    
    users.forEach(user => {
      const key = `${user.turma}-${user.escola}`;
      if (!turmasMap[key]) {
        turmasMap[key] = {
          turma: user.turma,
          escola: user.escola,
          totalEstudantes: 0,
          totalXp: 0,
          totalXpAtivos: 0,
          estudantesAtivos: 0,
          totalParticipacao: 0
        };
      }
      
      turmasMap[key].totalEstudantes++;
      turmasMap[key].totalXp += user.xp_atual || 0;
      
      // Contar usuários ativos (com XP > 0)
      if ((user.xp_atual || 0) > 0) {
        turmasMap[key].estudantesAtivos++;
        turmasMap[key].totalXpAtivos += user.xp_atual || 0;
      }
      
      // Calcular participação baseada no dia atual (10 questões)
      let participacao = 0;
      if (currentDay >= 1) participacao += (user.response_q1 ? 1 : 0);
      if (currentDay >= 2) participacao += (user.response_q2 ? 1 : 0);
      if (currentDay >= 3) participacao += (user.response_q3 ? 1 : 0);
      if (currentDay >= 4) participacao += (user.response_q4 ? 1 : 0);
      if (currentDay >= 5) participacao += (user.response_q5 ? 1 : 0);
      if (currentDay >= 6) participacao += (user.response_q6 ? 1 : 0);
      if (currentDay >= 7) participacao += (user.response_q7 ? 1 : 0);
      if (currentDay >= 8) participacao += (user.response_q8 ? 1 : 0);
      if (currentDay >= 9) participacao += (user.response_q9 ? 1 : 0);
      if (currentDay >= 10) participacao += (user.response_q10 ? 1 : 0);
      
      turmasMap[key].totalParticipacao += participacao;
    });

    // Calcular médias
    const turmas = Object.values(turmasMap).map(turma => ({
      turma: turma.turma,
      escola: turma.escola,
      totalEstudantes: turma.totalEstudantes,
      mediaXp: turma.estudantesAtivos > 0 ? turma.totalXpAtivos / turma.estudantesAtivos : 0, // Média apenas dos usuários ativos
      mediaParticipacao: turma.totalEstudantes > 0 && currentDay > 0 ? turma.totalParticipacao / (turma.totalEstudantes * currentDay) : 0 // Questões feitas / (participantes * dia atual)
    }));

    // Calcular score global (XP médio × participação média) e ordenar
    const turmasComScore = turmas.map(turma => {
      // Se a participação for 0%, o score deve ser 0
      const scoreGlobal = turma.mediaParticipacao === 0 ? 0 : Math.round(turma.mediaXp * turma.mediaParticipacao);
      
      // Debug log para as primeiras turmas
      if (turma.turma === '3ª Série A' || turma.turma === '2ª Série B') {
        console.log(`📊 Debug Ranking - ${turma.turma}:`);
        console.log(`  - Dia atual: ${currentDay}`);
        console.log(`  - Média XP: ${turma.mediaXp}`);
        console.log(`  - Média Participação: ${turma.mediaParticipacao} (${Math.round(turma.mediaParticipacao * 100)}%)`);
        console.log(`  - Score Global: ${scoreGlobal} (${turma.mediaXp} × ${turma.mediaParticipacao})`);
        console.log(`  - Fórmula: ${turma.mediaXp} × ${turma.mediaParticipacao} = ${scoreGlobal}`);
      }
      
      return {
        ...turma,
        mediaXp: Math.round(turma.mediaXp),
        mediaParticipacao: turma.mediaParticipacao, // Manter como decimal
        scoreGlobal: scoreGlobal
      };
    });

    // Ordenar por score global (maior para menor)
    turmasComScore.sort((a, b) => b.scoreGlobal - a.scoreGlobal);

    // Adicionar posição para cada turma
    const rankingCompleto = turmasComScore.map((turma, index) => ({
      ...turma,
      posicao: index + 1
    }));

    res.json({
      success: true,
      ranking: rankingCompleto
    });

  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar ranking de turmas'
    });
  }
});

// Rota para obter top 3 turmas
router.get('/top3', async (req, res) => {
  try {
    // Obter dia atual
    const currentDay = await getCurrentDay();
    
    // Buscar todos os usuários
    const users = await getUsers();

    // Agrupar por turma e calcular médias
    const turmasMap = {};
    
    users.forEach(user => {
      const key = `${user.turma}-${user.escola}`;
      if (!turmasMap[key]) {
        turmasMap[key] = {
          turma: user.turma,
          escola: user.escola,
          totalEstudantes: 0,
          totalXp: 0,
          totalXpAtivos: 0,
          estudantesAtivos: 0,
          totalParticipacao: 0
        };
      }
      
      turmasMap[key].totalEstudantes++;
      turmasMap[key].totalXp += user.xp_atual || 0;
      
      // Contar usuários ativos (com XP > 0)
      if ((user.xp_atual || 0) > 0) {
        turmasMap[key].estudantesAtivos++;
        turmasMap[key].totalXpAtivos += user.xp_atual || 0;
      }
      
      // Calcular participação baseada no dia atual (10 questões)
      let participacao = 0;
      if (currentDay >= 1) participacao += (user.response_q1 ? 1 : 0);
      if (currentDay >= 2) participacao += (user.response_q2 ? 1 : 0);
      if (currentDay >= 3) participacao += (user.response_q3 ? 1 : 0);
      if (currentDay >= 4) participacao += (user.response_q4 ? 1 : 0);
      if (currentDay >= 5) participacao += (user.response_q5 ? 1 : 0);
      if (currentDay >= 6) participacao += (user.response_q6 ? 1 : 0);
      if (currentDay >= 7) participacao += (user.response_q7 ? 1 : 0);
      if (currentDay >= 8) participacao += (user.response_q8 ? 1 : 0);
      if (currentDay >= 9) participacao += (user.response_q9 ? 1 : 0);
      if (currentDay >= 10) participacao += (user.response_q10 ? 1 : 0);
      
      turmasMap[key].totalParticipacao += participacao;
    });

    // Calcular médias
    const todasTurmas = Object.values(turmasMap).map(turma => ({
      turma: turma.turma,
      escola: turma.escola,
      totalEstudantes: turma.totalEstudantes,
      mediaXp: turma.estudantesAtivos > 0 ? turma.totalXpAtivos / turma.estudantesAtivos : 0, // Média apenas dos usuários ativos
      mediaParticipacao: turma.totalEstudantes > 0 && currentDay > 0 ? turma.totalParticipacao / (turma.totalEstudantes * currentDay) : 0 // Questões feitas / (participantes * dia atual)
    }));

    // Calcular score global e ordenar
    const turmasComScore = todasTurmas.map(turma => ({
      ...turma,
      mediaXp: Math.round(turma.mediaXp),
      mediaParticipacao: turma.mediaParticipacao, // Manter como decimal para o frontend converter
      scoreGlobal: turma.mediaParticipacao === 0 ? 0 : Math.round(turma.mediaXp * turma.mediaParticipacao)
    }));

    // Ordenar por score global e pegar top 3
    turmasComScore.sort((a, b) => b.scoreGlobal - a.scoreGlobal);
    const top3 = turmasComScore.slice(0, 3);

    // Adicionar posição para cada turma
    const top3Completo = top3.map((turma, index) => ({
      ...turma,
      posicao: index + 1
    }));

    res.json({
      success: true,
      top3: top3Completo
    });

  } catch (error) {
    console.error('Erro ao buscar top 3:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar top 3 turmas'
    });
  }
});

// Rota para obter posição de uma turma específica
router.get('/turma/:turma/:escola', async (req, res) => {
  try {
    const { turma, escola } = req.params;

    // Obter dia atual
    const currentDay = await getCurrentDay();

    // Buscar todos os usuários
    const users = await getUsers();

    // Filtrar usuários da turma específica
    const turmaUsers = users.filter(u => 
      u.turma === turma && u.escola === escola
    );

    if (turmaUsers.length === 0) {
      return res.status(404).json({
        error: 'Turma não encontrada',
        message: 'Turma não existe'
      });
    }

    // Calcular estatísticas da turma específica
    const totalEstudantes = turmaUsers.length;
    const totalXp = turmaUsers.reduce((sum, u) => sum + (u.xp_atual || 0), 0);
    
    // Calcular XP apenas dos usuários ativos
    const estudantesAtivos = turmaUsers.filter(u => (u.xp_atual || 0) > 0);
    const totalXpAtivos = estudantesAtivos.reduce((sum, u) => sum + (u.xp_atual || 0), 0);
    const mediaXp = estudantesAtivos.length > 0 ? totalXpAtivos / estudantesAtivos.length : 0;
    
    let totalParticipacao = 0;
    turmaUsers.forEach(u => {
      // Calcular participação baseada no dia atual (10 questões)
      let participacao = 0;
      if (currentDay >= 1) participacao += (u.response_q1 ? 1 : 0);
      if (currentDay >= 2) participacao += (u.response_q2 ? 1 : 0);
      if (currentDay >= 3) participacao += (u.response_q3 ? 1 : 0);
      if (currentDay >= 4) participacao += (u.response_q4 ? 1 : 0);
      if (currentDay >= 5) participacao += (u.response_q5 ? 1 : 0);
      if (currentDay >= 6) participacao += (u.response_q6 ? 1 : 0);
      if (currentDay >= 7) participacao += (u.response_q7 ? 1 : 0);
      if (currentDay >= 8) participacao += (u.response_q8 ? 1 : 0);
      if (currentDay >= 9) participacao += (u.response_q9 ? 1 : 0);
      if (currentDay >= 10) participacao += (u.response_q10 ? 1 : 0);
      totalParticipacao += participacao;
    });
    const mediaParticipacao = totalEstudantes > 0 && currentDay > 0 ? totalParticipacao / (totalEstudantes * currentDay) : 0;

    // Calcular score global para todas as turmas
    const turmasMap = {};
    users.forEach(user => {
      const key = `${user.turma}-${user.escola}`;
      if (!turmasMap[key]) {
        turmasMap[key] = {
          turma: user.turma,
          escola: user.escola,
          totalEstudantes: 0,
          totalXp: 0,
          totalXpAtivos: 0,
          estudantesAtivos: 0,
          totalParticipacao: 0
        };
      }
      
      turmasMap[key].totalEstudantes++;
      turmasMap[key].totalXp += user.xp_atual || 0;
      
      // Contar usuários ativos (com XP > 0)
      if ((user.xp_atual || 0) > 0) {
        turmasMap[key].estudantesAtivos++;
        turmasMap[key].totalXpAtivos += user.xp_atual || 0;
      }
      
      // Calcular participação baseada no dia atual (10 questões)
      let participacao = 0;
      if (currentDay >= 1) participacao += (user.response_q1 ? 1 : 0);
      if (currentDay >= 2) participacao += (user.response_q2 ? 1 : 0);
      if (currentDay >= 3) participacao += (user.response_q3 ? 1 : 0);
      if (currentDay >= 4) participacao += (user.response_q4 ? 1 : 0);
      if (currentDay >= 5) participacao += (user.response_q5 ? 1 : 0);
      if (currentDay >= 6) participacao += (user.response_q6 ? 1 : 0);
      if (currentDay >= 7) participacao += (user.response_q7 ? 1 : 0);
      if (currentDay >= 8) participacao += (user.response_q8 ? 1 : 0);
      if (currentDay >= 9) participacao += (user.response_q9 ? 1 : 0);
      if (currentDay >= 10) participacao += (user.response_q10 ? 1 : 0);
      
      turmasMap[key].totalParticipacao += participacao;
    });

    const todasTurmas = Object.values(turmasMap).map(turma => ({
      turma: turma.turma,
      escola: turma.escola,
      mediaXp: turma.estudantesAtivos > 0 ? turma.totalXpAtivos / turma.estudantesAtivos : 0,
      mediaParticipacao: turma.totalEstudantes > 0 && currentDay > 0 ? turma.totalParticipacao / (turma.totalEstudantes * currentDay) : 0,
      scoreGlobal: turma.totalEstudantes > 0 && currentDay > 0 ? Math.round((turma.estudantesAtivos > 0 ? turma.totalXpAtivos / turma.estudantesAtivos : 0) * (turma.totalParticipacao / (turma.totalEstudantes * currentDay))) : 0
    }));

    // Ordenar por score global (maior para menor)
    todasTurmas.sort((a, b) => b.scoreGlobal - a.scoreGlobal);

    // Encontrar posição da turma específica
    const posicao = todasTurmas.findIndex(t => 
      t.turma === turma && t.escola === escola
    ) + 1;

    res.json({
      success: true,
      turma: {
        turma: turma,
        escola: escola,
        totalEstudantes: totalEstudantes,
        posicao: posicao,
        mediaXp: Math.round(mediaXp),
        mediaParticipacao: mediaParticipacao, // Manter como decimal
        scoreGlobal: mediaParticipacao === 0 ? 0 : Math.round(mediaXp * mediaParticipacao)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar posição da turma:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar posição da turma'
    });
  }
});

// Rota para obter detalhes da turma do usuário
router.get('/minha-turma', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token não fornecido',
        message: 'Token de autenticação é obrigatório'
      });
    }

    // Verificar token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'ga_quiz_secret_key_2024_bahia_education'
    );

    // Buscar dados do usuário
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não existe'
      });
    }

    // Obter dia atual
    const currentDay = await getCurrentDay();
    
    // Buscar todos os usuários
    const allUsers = await getUsers();

    // Filtrar estudantes da mesma turma
    const estudantesTurma = allUsers.filter(u => 
      u.turma === user.turma && u.escola === user.escola
    ).sort((a, b) => (b.xp_atual || 0) - (a.xp_atual || 0));

    // Calcular estatísticas da turma
    const totalEstudantes = estudantesTurma.length;
    const totalXp = estudantesTurma.reduce((sum, u) => sum + (u.xp_atual || 0), 0);
    
    // Calcular XP apenas dos usuários ativos
    const estudantesAtivos = estudantesTurma.filter(u => (u.xp_atual || 0) > 0);
    const totalXpAtivos = estudantesAtivos.reduce((sum, u) => sum + (u.xp_atual || 0), 0);
    const mediaXp = estudantesAtivos.length > 0 ? totalXpAtivos / estudantesAtivos.length : 0;
    
    let totalParticipacao = 0;
    estudantesTurma.forEach(u => {
      // Calcular participação baseada no dia atual (10 questões)
      let participacao = 0;
      if (currentDay >= 1) participacao += (u.response_q1 ? 1 : 0);
      if (currentDay >= 2) participacao += (u.response_q2 ? 1 : 0);
      if (currentDay >= 3) participacao += (u.response_q3 ? 1 : 0);
      if (currentDay >= 4) participacao += (u.response_q4 ? 1 : 0);
      if (currentDay >= 5) participacao += (u.response_q5 ? 1 : 0);
      if (currentDay >= 6) participacao += (u.response_q6 ? 1 : 0);
      if (currentDay >= 7) participacao += (u.response_q7 ? 1 : 0);
      if (currentDay >= 8) participacao += (u.response_q8 ? 1 : 0);
      if (currentDay >= 9) participacao += (u.response_q9 ? 1 : 0);
      if (currentDay >= 10) participacao += (u.response_q10 ? 1 : 0);
      totalParticipacao += participacao;
    });
    const mediaParticipacao = totalEstudantes > 0 && currentDay > 0 ? totalParticipacao / (totalEstudantes * currentDay) : 0;
    
    // Debug logs
    console.log('📊 Debug - Média Participação:');
    console.log('  - Total estudantes:', totalEstudantes);
    console.log('  - Total participação:', totalParticipacao);
    console.log('  - Dia atual:', currentDay);
    console.log('  - Média calculada:', mediaParticipacao);

    // Calcular score global para todas as turmas
    const turmasMap = {};
    allUsers.forEach(user => {
      const key = `${user.turma}-${user.escola}`;
      if (!turmasMap[key]) {
        turmasMap[key] = {
          turma: user.turma,
          escola: user.escola,
          totalEstudantes: 0,
          totalXp: 0,
          totalXpAtivos: 0,
          estudantesAtivos: 0,
          totalParticipacao: 0
        };
      }
      
      turmasMap[key].totalEstudantes++;
      turmasMap[key].totalXp += user.xp_atual || 0;
      
      // Contar usuários ativos (com XP > 0)
      if ((user.xp_atual || 0) > 0) {
        turmasMap[key].estudantesAtivos++;
        turmasMap[key].totalXpAtivos += user.xp_atual || 0;
      }
      // Calcular participação baseada no dia atual (10 questões)
      let participacao = 0;
      if (currentDay >= 1) participacao += (user.response_q1 ? 1 : 0);
      if (currentDay >= 2) participacao += (user.response_q2 ? 1 : 0);
      if (currentDay >= 3) participacao += (user.response_q3 ? 1 : 0);
      if (currentDay >= 4) participacao += (user.response_q4 ? 1 : 0);
      if (currentDay >= 5) participacao += (user.response_q5 ? 1 : 0);
      if (currentDay >= 6) participacao += (user.response_q6 ? 1 : 0);
      if (currentDay >= 7) participacao += (user.response_q7 ? 1 : 0);
      if (currentDay >= 8) participacao += (user.response_q8 ? 1 : 0);
      if (currentDay >= 9) participacao += (user.response_q9 ? 1 : 0);
      if (currentDay >= 10) participacao += (user.response_q10 ? 1 : 0);
      turmasMap[key].totalParticipacao += participacao;
    });

    const todasTurmas = Object.values(turmasMap).map(turma => ({
      turma: turma.turma,
      escola: turma.escola,
      mediaXp: turma.estudantesAtivos > 0 ? turma.totalXpAtivos / turma.estudantesAtivos : 0,
      mediaParticipacao: turma.totalEstudantes > 0 && currentDay > 0 ? turma.totalParticipacao / (turma.totalEstudantes * currentDay) : 0,
      scoreGlobal: turma.totalEstudantes > 0 && currentDay > 0 ? Math.round((turma.estudantesAtivos > 0 ? turma.totalXpAtivos / turma.estudantesAtivos : 0) * (turma.totalParticipacao / (turma.totalEstudantes * currentDay))) : 0
    }));

    // Ordenar por score global (maior para menor)
    todasTurmas.sort((a, b) => b.scoreGlobal - a.scoreGlobal);

    // Encontrar posição da turma do usuário
    const posicaoGlobal = todasTurmas.findIndex(t => 
      t.turma === user.turma && t.escola === user.escola
    ) + 1;

    // Formatar dados dos estudantes
    const estudantesFormatados = estudantesTurma.map(estudante => {
      const desafiosCompletados = (
        (estudante.response_q1 ? 1 : 0) +
        (estudante.response_q2 ? 1 : 0) +
        (estudante.response_q3 ? 1 : 0) +
        (estudante.response_q4 ? 1 : 0) +
        (estudante.response_q5 ? 1 : 0) +
        (estudante.response_q6 ? 1 : 0) +
        (estudante.response_q7 ? 1 : 0) +
        (estudante.response_q8 ? 1 : 0) +
        (estudante.response_q9 ? 1 : 0) +
        (estudante.response_q10 ? 1 : 0)
      );
      
      return {
        id: estudante.id,
        nome: `Aluno ${estudante.login}`,
        xp: estudante.xp_atual || 0,
        desafiosCompletados: desafiosCompletados,
        nivel: Math.floor((estudante.xp_atual || 0) / 100) + 1
      };
    });

    res.json({
      success: true,
      turma: {
        nome: user.turma,
        escola: user.escola,
        totalEstudantes: totalEstudantes,
        mediaXp: Math.round(mediaXp),
        mediaParticipacao: mediaParticipacao, // Manter como decimal
        posicaoRanking: posicaoGlobal,
        scoreGlobal: mediaParticipacao === 0 ? 0 : Math.round(mediaXp * mediaParticipacao)
      },
      estudantes: estudantesFormatados
    });

  } catch (error) {
    console.error('Erro ao buscar detalhes da turma:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar detalhes da turma'
    });
  }
});

// Rota para obter posição individual do usuário no ranking geral
router.get('/user-position', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token não fornecido',
        message: 'Token de autenticação é obrigatório'
      });
    }

    // Verificar token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'ga_quiz_secret_key_2024_bahia_education'
    );

    // Buscar dados do usuário
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não existe'
      });
    }

    // Buscar todos os usuários
    const allUsers = await getUsers();

    console.log('🔍 Debug ranking:');
    console.log(`  - ID do usuário logado: ${user.id}`);
    console.log(`  - ID do token: ${decoded.id}`);
    console.log(`  - Total de usuários: ${allUsers.length}`);

    // Ordenar usuários por XP (maior para menor)
    const rankingGeral = allUsers
      .filter(u => u.xp_atual !== undefined) // Filtrar usuários válidos
      .sort((a, b) => (b.xp_atual || 0) - (a.xp_atual || 0));

    console.log(`  - Usuários válidos no ranking: ${rankingGeral.length}`);
    console.log('  - Top 5 do ranking:');
    rankingGeral.slice(0, 5).forEach((u, i) => {
      console.log(`    ${i + 1}. ID: ${u.id}, Login: ${u.login}, XP: ${u.xp_atual}`);
    });

    // Encontrar posição do usuário
    const posicao = rankingGeral.findIndex(u => u.id === user.id || u.id === decoded.id) + 1;
    
    console.log(`  - Posição encontrada: ${posicao}`);

    // Calcular estatísticas
    const totalUsuarios = rankingGeral.length;
    const xpUsuario = user.xp_atual || 0;
    const nivelUsuario = Math.floor(xpUsuario / 50) + 1;

    res.json({
      success: true,
      user: {
        id: user.id,
        login: user.login,
        nome: `Aluno ${user.login}`,
        xp: xpUsuario,
        nivel: nivelUsuario,
        posicao: posicao,
        totalUsuarios: totalUsuarios
      }
    });

  } catch (error) {
    console.error('Erro ao buscar posição do usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar posição do usuário'
    });
  }
});

module.exports = router; 