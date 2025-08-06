const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUsers, getUserById } = require('../database/firebase');

const router = express.Router();

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { login, senha } = req.body;

    console.log('🔍 Debug - Tentativa de login:');
    console.log(`  - Login: ${login}`);
    console.log(`  - Senha fornecida: ${senha}`);

    // Validar dados de entrada
    if (!login || !senha) {
      console.log('❌ Dados incompletos');
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'Login e senha são obrigatórios'
      });
    }

    // Buscar usuário no Firebase
    const users = await getUsers();
    const user = Object.values(users).find(u => u.login === login);

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Usuário não encontrado'
      });
    }

    // Garantir que o usuário tenha um ID
    const userId = user.id || user.login;
    
    console.log(`✅ Usuário encontrado: ${user.login}`);
    console.log(`🆔 ID do usuário: ${userId}`);
    console.log(`📊 XP: ${user.xp_atual}`);
    console.log(`🔐 Senha no Firebase: ${user.senha ? 'Definida' : 'Não definida'}`);

    // Verificar se o usuário tem senha definida
    if (!user.senha) {
      console.log('❌ Usuário sem senha definida');
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Usuário sem senha definida'
      });
    }

    // Verificar senha usando comparação de string simples
    console.log('🔐 Verificando senha...');
    const isValidPassword = senha === user.senha;
    console.log(`🔐 Senha válida: ${isValidPassword ? '✅ Sim' : '❌ Não'}`);

    if (!isValidPassword) {
      console.log('❌ Senha incorreta');
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Senha incorreta'
      });
    }

    console.log('✅ Autenticação bem-sucedida!');

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: userId, 
        login: user.login,
        turma: user.turma,
        escola: user.escola
      },
      process.env.JWT_SECRET || 'ga_quiz_secret_key_2024_bahia_education',
      { expiresIn: '24h' }
    );

    // Calcular nível baseado no XP (usando 50 XP por nível)
    const nivel = Math.floor(user.xp_atual / 50) + 1;
    
    // Retornar dados do usuário (sem senha) e token
    const userData = {
      id: userId,
      login: user.login,
      nome: user.nome || `Aluno ${user.login}`, // Usar nome do Firebase se existir
      nivel: nivel,
      xp: user.xp_atual,
      escola: user.escola || 'FGV MALHADOS INTELECTUAIS', // Usar escola do Firebase
      serie: user.serie || 'EQUIPE BASE', // Usar série do Firebase
      turma: user.turma,
      // Remover dados mock de ranking - deixar para a API de ranking calcular
      // posicaoTurma: 2, // Mock data
      // posicaoSerie: 5, // Mock data
      // posicaoEscola: 8, // Mock data
      // posicaoTurmaGeral: 3, // Mock data
      // posicaoEscolaGeral: 2, // Mock data
      xp_atual: user.xp_atual,
      erros: user.erros,
      id_q1: user.id_q1,
      response_q1: user.response_q1,
      id_q2: user.id_q2,
      response_q2: user.response_q2,
      id_q3: user.id_q3,
      response_q3: user.response_q3,
      id_q4: user.id_q4,
      response_q4: user.response_q4
    };

    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      token,
      user: userData
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao processar login'
    });
  }
});

// Rota para verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token não fornecido',
        message: 'Token de autenticação é obrigatório'
      });
    }

    // Verificar token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'ga_quiz_secret_key_2024_bahia_education'
    );

    // Buscar usuário no Firebase
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado',
        message: 'Token inválido'
      });
    }

    // Calcular nível baseado no XP (usando 50 XP por nível)
    const nivel = Math.floor(user.xp_atual / 50) + 1;

    const userData = {
      id: user.id,
      login: user.login,
      nome: user.nome || `Aluno ${user.login}`,
      nivel: nivel,
      xp: user.xp_atual,
      escola: user.escola || 'FGV MALHADOS INTELECTUAIS',
      serie: user.serie || 'EQUIPE BASE',
      turma: user.turma,
      // Remover dados mock de ranking - deixar para a API de ranking calcular
      // posicaoTurma: 2,
      // posicaoSerie: 5,
      // posicaoEscola: 8,
      // posicaoTurmaGeral: 3,
      // posicaoEscolaGeral: 2,
      xp_atual: user.xp_atual,
      erros: user.erros,
      id_q1: user.id_q1,
      response_q1: user.response_q1,
      id_q2: user.id_q2,
      response_q2: user.response_q2,
      id_q3: user.id_q3,
      response_q3: user.response_q3,
      id_q4: user.id_q4,
      response_q4: user.response_q4
    };

    res.json(userData);

  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(401).json({
      error: 'Token inválido',
      message: 'Token de autenticação inválido'
    });
  }
});

module.exports = router; 