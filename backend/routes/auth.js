const express = require('express');
const bcrypt = require('bcryptjs');
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

    // Buscar usuário no banco PostgreSQL
    const result = await pool.query(
      'SELECT * FROM users WHERE login = $1',
      [login]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Usuário não encontrado'
      });
    }

    const user = result.rows[0];

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

    // Calcular nível baseado no XP (usando 100 XP por nível)
    const nivel = Math.floor(user.xp_atual / 100) + 1;
    
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
      response_q5: user.response_q5,
      id_q6: user.id_q6,
      response_q6: user.response_q6,
      id_q7: user.id_q7,
      response_q7: user.response_q7,
      id_q8: user.id_q8,
      response_q8: user.response_q8,
      id_q9: user.id_q9,
      response_q9: user.response_q9,
      id_q10: user.id_q10,
      response_q10: user.response_q10
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
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Usuário não encontrado',
        message: 'Token inválido'
      });
    }

    const user = result.rows[0];

    // Calcular nível baseado no XP (usando 100 XP por nível)
    const nivel = Math.floor(user.xp_atual / 100) + 1;
    
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
      response_q5: user.response_q5,
      id_q6: user.id_q6,
      response_q6: user.response_q6,
      id_q7: user.id_q7,
      response_q7: user.response_q7,
      id_q8: user.id_q8,
      response_q8: user.response_q8,
      id_q9: user.id_q9,
      response_q9: user.response_q9,
      id_q10: user.id_q10,
      response_q10: user.response_q10
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