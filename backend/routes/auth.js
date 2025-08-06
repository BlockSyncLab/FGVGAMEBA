const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../database/connection');

const router = express.Router();

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { login, senha } = req.body;

    // Validar dados de entrada
    if (!login || !senha) {
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'Login e senha são obrigatórios'
      });
    }

    // Buscar usuário no banco
    const users = await executeQuery(
      'SELECT * FROM users WHERE login = ?',
      [login]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Usuário não encontrado'
      });
    }

    const user = users[0];

    // Verificar senha usando bcrypt
    const isValidPassword = await bcrypt.compare(senha, user.senha);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Senha incorreta'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
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
      id: user.id,
      login: user.login,
      nome: `Aluno ${user.login}`, // Nome baseado no login
      nivel: nivel,
      xp: user.xp_atual,
      escola: user.escola,
      serie: user.turma.split(' ')[0] + ' ' + user.turma.split(' ')[1], // Extrair série da turma
      turma: user.turma.split(' ')[2], // Extrair turma (A, B, C, etc.)
      posicaoTurma: 2, // Mock data
      posicaoSerie: 5, // Mock data
      posicaoEscola: 8, // Mock data
      posicaoTurmaGeral: 3, // Mock data
      posicaoEscolaGeral: 2, // Mock data
      xp_atual: user.xp_atual,
      erros: user.erros,
      id_q1: user.id_q1,
      response_q1: user.response_q1,
      id_q2: user.id_q2,
      response_q2: user.response_q2,
      id_q3: user.id_q3,
      response_q3: user.response_q3,
      id_q4: user.id_q4,
      response_q4: user.response_q4,
      id_q5: user.id_q5,
      response_q5: user.response_q5
    };

    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao processar login'
    });
  }
});

// Rota para verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

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

    // Buscar dados atualizados do usuário
    const users = await executeQuery(
      'SELECT * FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Usuário não encontrado',
        message: 'Token inválido'
      });
    }

    const user = users[0];

    // Calcular nível baseado no XP (usando 50 XP por nível)
    const nivel = Math.floor(user.xp_atual / 50) + 1;
    
    // Retornar dados do usuário (sem senha)
    const userData = {
      id: user.id,
      login: user.login,
      nome: `Aluno ${user.login}`, // Nome baseado no login
      nivel: nivel,
      xp: user.xp_atual,
      escola: user.escola,
      serie: user.turma.split(' ')[0] + ' ' + user.turma.split(' ')[1], // Extrair série da turma
      turma: user.turma.split(' ')[2], // Extrair turma (A, B, C, etc.)
      posicaoTurma: 2, // Mock data
      posicaoSerie: 5, // Mock data
      posicaoEscola: 8, // Mock data
      posicaoTurmaGeral: 3, // Mock data
      posicaoEscolaGeral: 2, // Mock data
      xp_atual: user.xp_atual,
      erros: user.erros,
      id_q1: user.id_q1,
      response_q1: user.response_q1,
      id_q2: user.id_q2,
      response_q2: user.response_q2,
      id_q3: user.id_q3,
      response_q3: user.response_q3,
      id_q4: user.id_q4,
      response_q4: user.response_q4,
      id_q5: user.id_q5,
      response_q5: user.response_q5
    };

    res.json({
      success: true,
      message: 'Token válido',
      user: userData
    });

  } catch (error) {
    console.error('Erro na verificação do token:', error);
    res.status(401).json({
      error: 'Token inválido',
      message: 'Token de autenticação inválido ou expirado'
    });
  }
});

module.exports = router; 