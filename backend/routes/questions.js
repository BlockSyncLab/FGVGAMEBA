const express = require('express');
const jwt = require('jsonwebtoken');
const { 
  getUsers, 
  getUserById, 
  updateUser, 
  getQuestions, 
  getQuestionById,
  getCampanhaConfig,
  logSecurityViolation 
} = require('../database/firebase');

const router = express.Router();

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

// Função para obter configuração da campanha
async function getCampanhaConfigLocal() {
  try {
    const config = await getCampanhaConfig();
    return config || null;
  } catch (error) {
    console.error('Erro ao buscar configuração da campanha:', error);
    return null;
  }
}

// Função para obter o dia atual da campanha
async function getCurrentDay() {
  try {
    const config = await getCampanhaConfigLocal();
    
    if (!config) {
      console.log('⚠️ Nenhuma campanha ativa encontrada, usando dia 1 como padrão');
      return 1;
    }
    
    // Usar current_day da configuração (atualizado automaticamente à meia-noite)
    if (config.current_day !== undefined) {
      console.log(`📅 Usando current_day da configuração: ${config.current_day}`);
      return config.current_day;
    }
    
    // Fallback: calcular baseado na data real (para compatibilidade)
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
    
    console.log(`📅 Calculado dia atual da campanha: ${currentDay} (${config.duracao_dias} dias total)`);
    
    return currentDay;
  } catch (error) {
    console.error('Erro ao calcular dia atual:', error);
    return 1; // Fallback para dia 1
  }
}

// Função para verificar se a resposta está atrasada
function isRespostaAtrasada(questionDay, currentDay) {
  return questionDay < currentDay;
}

// Função para registrar tentativas de acesso não autorizado
async function logSecurityViolationLocal(userId, action, details, req) {
  const timestamp = new Date().toISOString();
  console.log(`🚨 VIOLAÇÃO DE SEGURANÇA [${timestamp}]:`);
  console.log(`   👤 Usuário ID: ${userId}`);
  console.log(`   🎯 Ação: ${action}`);
  console.log(`   📝 Detalhes: ${details}`);
  console.log(`   🔍 IP: ${req?.ip || 'N/A'}`);
  console.log(`   🌐 User-Agent: ${req?.headers['user-agent'] || 'N/A'}`);
  
  // Salvar no banco de dados
  try {
    await logSecurityViolation(userId, action, details, req);
  } catch (error) {
    console.error('Erro ao salvar log de segurança:', error);
  }
}

// Rota para obter perguntas disponíveis
router.get('/available', authenticateToken, async (req, res) => {
  try {
    const currentDay = await getCurrentDay();
    const userId = req.user.id;
    
    // Buscar configuração da campanha
    const config = await getCampanhaConfigLocal();
    const maxDays = config ? config.duracao_dias : 4;
    
    console.log('👤 User ID:', userId);
    console.log('📅 Dia atual da campanha:', currentDay);
    console.log('📊 Máximo de dias:', maxDays);
    
    // VALIDAÇÃO DE SEGURANÇA: Verificar se a campanha está ativa
    if (currentDay === 0) {
      return res.status(403).json({
        error: 'Campanha não iniciada',
        message: 'A campanha ainda não começou. Aguarde a data de início.'
      });
    }
    
    if (currentDay > maxDays) {
      return res.status(403).json({
        error: 'Campanha finalizada',
        message: 'A campanha já foi finalizada.'
      });
    }

    // Buscar dados do usuário
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não existe'
      });
    }

    const availableQuestions = [];

    // Verificar quais perguntas estão disponíveis baseado no dia atual
    for (let day = 1; day <= Math.min(currentDay, maxDays); day++) {
      const questionId = user[`id_q${day}`];
      const hasAnswered = user[`response_q${day}`];

      if (questionId) {
        // Buscar dados da pergunta
        const question = await getQuestionById(questionId);

        if (question) {
          
          availableQuestions.push({
            day: day,
            id: questionId,
            pergunta: question.pergunta,
            imagem: question.imagem,
            dica: question.dica,
            a1: question.a1,
            a2: question.a2,
            a3: question.a3,
            a4: question.a4,
            a5: question.a5,
            ac: question.ac,
            hasAnswered: hasAnswered,
            isAvailable: day <= currentDay
          });
        }
      }
    }

    // Filtrar apenas questões disponíveis (não previews)
    const availableQuestionsFiltered = availableQuestions.filter(q => q.isAvailable && !q.hasAnswered);

    // Se não há questões disponíveis, buscar a dica da próxima pergunta
    let nextHint = null;
    if (availableQuestionsFiltered.length === 0 && currentDay < maxDays) {
      const nextDay = currentDay + 1;
      const nextQuestionId = user[`id_q${nextDay}`];
      
      if (nextQuestionId) {
        const nextQuestion = await getQuestionById(nextQuestionId);

        if (nextQuestion) {
          nextHint = nextQuestion.dica;
        }
      }
    }

    res.json({
      success: true,
      currentDay: currentDay,
      maxDays: maxDays,
      questions: availableQuestionsFiltered,
      nextHint: nextHint
    });

  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar perguntas disponíveis'
    });
  }
});

// Rota para responder pergunta
router.post('/answer', authenticateToken, async (req, res) => {
  try {
    console.log('📝 Recebendo resposta:', req.body);
    const { questionId, answer } = req.body;
    const userId = req.user.id;
    const currentDay = await getCurrentDay();
    
    console.log('👤 User ID:', userId);
    console.log('📅 Dia atual:', currentDay);
    console.log('❓ Question ID:', questionId);
    console.log('✅ Answer:', answer);

    // Validar dados de entrada
    if (!questionId || answer === undefined) {
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'ID da questão e resposta são obrigatórios'
      });
    }

    // Buscar dados do usuário
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não existe'
      });
    }

    // Encontrar qual dia corresponde a esta questão
    let questionDay = null;
    for (let day = 1; day <= 4; day++) {
      if (user[`id_q${day}`] === questionId) {
        questionDay = day;
        break;
      }
    }

    if (!questionDay) {
      await logSecurityViolationLocal(userId, 'TENTATIVA_ACESSO_QUESTAO_NAO_ATRIBUIDA', `Tentou acessar questão ID ${questionId} que não foi atribuída`, req);
      return res.status(403).json({
        error: 'Acesso não autorizado',
        message: 'Esta questão não foi atribuída ao seu usuário. Acesso bloqueado por segurança.'
      });
    }

    // VALIDAÇÃO DE SEGURANÇA: Verificar se o dia está disponível
    if (questionDay > currentDay) {
      await logSecurityViolationLocal(userId, 'TENTATIVA_ACESSO_FUTURO', `Tentou acessar questão do dia ${questionDay}, dia atual: ${currentDay}`, req);
      return res.status(403).json({
        error: 'Acesso não autorizado',
        message: 'Esta pergunta ainda não foi liberada. Acesso bloqueado por segurança.'
      });
    }
    
    // VALIDAÇÃO ADICIONAL: Verificar se a campanha está ativa
    if (currentDay === 0) {
      return res.status(403).json({
        error: 'Campanha não iniciada',
        message: 'A campanha ainda não começou.'
      });
    }

    // Verificar se já respondeu esta pergunta
    if (user[`response_q${questionDay}`]) {
      return res.status(400).json({
        error: 'Pergunta já respondida',
        message: 'Você já respondeu esta pergunta'
      });
    }

    // Buscar dados da pergunta
    const question = await getQuestionById(questionId);

    if (!question) {
      return res.status(404).json({
        error: 'Pergunta não encontrada',
        message: 'Pergunta não existe'
      });
    }
    // O frontend envia o índice (0-4), mas o backend tem a alternativa correta como 1-5
    // Então precisamos ajustar: answer + 1 === question.ac
    const isCorrect = (answer + 1) === question.ac;
    
    // Calcular XP base
    let xpGain = isCorrect ? 50 : -10; // -10 XP para resposta incorreta
    
    // Verificar se a resposta está atrasada
    const isAtrasada = isRespostaAtrasada(questionDay, currentDay);
    if (isCorrect && isAtrasada) {
      xpGain = 45; // Desconto de 5 pontos por atraso
      console.log('⏰ Resposta atrasada: -5 XP (45 ao invés de 50)');
    }
    
    console.log('🔍 Verificando resposta:');
    console.log('📝 Resposta enviada (índice):', answer);
    console.log('✅ Alternativa correta (1-5):', question.ac);
    console.log('🎯 Resposta ajustada:', answer + 1);
    console.log('✅ Está correto?', isCorrect);

    // Atualizar dados do usuário
    const updates = {};

    // Só marcar como respondida se acertou
    if (isCorrect) {
      updates[`response_q${questionDay}`] = true;
    }

    // Adicionar/remover XP
    updates.xp_atual = (user.xp_atual || 0) + xpGain;

    // Incrementar erros se errou
    if (!isCorrect) {
      updates.erros = (user.erros || 0) + 1;
      updates.respostas_incorretas = (user.respostas_incorretas || 0) + 1;
    }

    // Incrementar contador de respostas atrasadas se acertou mas está atrasada
    if (isCorrect && isAtrasada) {
      updates.respostas_atrasadas = (user.respostas_atrasadas || 0) + 1;
    }

    await updateUser(userId, updates);

    // Se acertou, buscar a dica da próxima questão (máximo dia 4)
    let nextHint = null;
    if (isCorrect && questionDay < 4) {
      const nextDay = questionDay + 1;
      const nextQuestionId = user[`id_q${nextDay}`];
      
      console.log('🔍 Buscando dica da próxima questão:');
      console.log('📅 Próximo dia:', nextDay);
      console.log('❓ Próxima questão ID:', nextQuestionId);
      
      if (nextQuestionId) {
        const nextQuestion = await getQuestionById(nextQuestionId);

        if (nextQuestion) {
          nextHint = nextQuestion.dica;
          console.log('💡 Dica encontrada:', nextHint);
        } else {
          console.log('❌ Próxima questão não encontrada');
        }
      } else {
        console.log('❌ Próxima questão ID não definida');
      }
    }

    res.json({
      success: true,
      isCorrect: isCorrect,
      xpGained: xpGain, // Mudando de xpGain para xpGained
      correctAnswer: question.ac,
      nextHint: nextHint,
      isAtrasada: isAtrasada,
      message: isCorrect 
        ? (isAtrasada 
          ? 'Parabéns! Resposta correta! +45 XP (resposta atrasada)' 
          : 'Parabéns! Resposta correta! +50 XP')
        : 'Ops! Resposta incorreta. -10 XP. Tente novamente!'
    });

  } catch (error) {
    console.error('Erro ao processar resposta:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao processar resposta'
    });
  }
});

// Rota para obter informações da próxima pergunta
router.get('/next-question-info', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const currentDay = await getCurrentDay();
    
    // Buscar dados do usuário
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não existe'
      });
    }

    const nextDay = currentDay + 1;
    
    // Verificar se há próxima pergunta
    if (nextDay > 4) {
      return res.json({
        success: true,
        hasNextQuestion: false,
        message: 'Campanha finalizada'
      });
    }

    const nextQuestionId = user[`id_q${nextDay}`];
    
    if (!nextQuestionId) {
      return res.json({
        success: true,
        hasNextQuestion: false,
        message: 'Não há próxima pergunta'
      });
    }

    // Buscar dados da próxima pergunta
    const nextQuestion = await getQuestionById(nextQuestionId);

    if (!nextQuestion) {
      return res.json({
        success: true,
        hasNextQuestion: false,
        message: 'Próxima pergunta não encontrada'
      });
    }
    
    // Calcular tempo até a próxima pergunta (baseado no fuso horário do Brasil)
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const tomorrow = new Date(brazilTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilNext = tomorrow.getTime() - brazilTime.getTime();
    const hoursUntilNext = Math.floor(timeUntilNext / (1000 * 60 * 60));
    const minutesUntilNext = Math.floor((timeUntilNext % (1000 * 60 * 60)) / (1000 * 60));

    res.json({
      success: true,
      hasNextQuestion: true,
      nextDay: nextDay,
      nextQuestion: {
        id: nextQuestion.id,
        pergunta: nextQuestion.pergunta,
        dica: nextQuestion.dica
      },
      timeUntilNext: {
        hours: hoursUntilNext,
        minutes: minutesUntilNext,
        totalSeconds: Math.floor(timeUntilNext / 1000)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar informações da próxima pergunta:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar informações da próxima pergunta'
    });
  }
});

// Rota para obter estatísticas do usuário
router.get('/stats', authenticateToken, async (req, res) => {
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

    let answeredQuestions = 0;
    let correctAnswers = 0;

    // Contar perguntas respondidas
    for (let day = 1; day <= 4; day++) {
      if (user[`response_q${day}`]) {
        answeredQuestions++;
        
        // Verificar se acertou (precisaria de uma tabela de respostas)
        // Por enquanto, vamos assumir que todas as respostas estão corretas
        correctAnswers++;
      }
    }

    res.json({
      success: true,
      stats: {
        totalQuestions: 4,
        answeredQuestions: answeredQuestions,
        correctAnswers: correctAnswers,
        xpAtual: user.xp_atual,
        erros: user.erros,
        accuracy: answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar estatísticas'
    });
  }
});

module.exports = router; 