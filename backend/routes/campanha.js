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

// Rota para obter configuração atual da campanha
router.get('/config', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM campanha_config WHERE ativa = true ORDER BY id DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Configuração não encontrada',
        message: 'Nenhuma campanha ativa encontrada'
      });
    }

    const config = result.rows[0];
    const dataInicio = new Date(config.data_inicio);
    const dataAtual = new Date();
    const diffTime = dataAtual.getTime() - dataInicio.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let status = 'ativa';
    let diaAtual = 0;
    
    if (diffDays < 0) {
      status = 'aguardando';
      diaAtual = 0;
    } else if (diffDays >= config.duracao_dias) {
      status = 'finalizada';
      diaAtual = config.duracao_dias;
    } else {
      diaAtual = diffDays + 1;
    }

    res.json({
      success: true,
      config: {
        ...config,
        status,
        diaAtual,
        diasRestantes: Math.max(0, config.duracao_dias - diaAtual),
        dataInicio: config.data_inicio,
        dataFim: new Date(dataInicio.getTime() + (config.duracao_dias * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Erro ao buscar configuração da campanha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar configuração da campanha'
    });
  }
});

// Rota para atualizar configuração da campanha (apenas admin)
router.put('/config', authenticateToken, async (req, res) => {
  try {
    const { data_inicio, duracao_dias } = req.body;

    // Validar dados
    if (!data_inicio || !duracao_dias) {
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'Data de início e duração são obrigatórios'
      });
    }

    // Validar formato da data
    const dataInicio = new Date(data_inicio);
    if (isNaN(dataInicio.getTime())) {
      return res.status(400).json({
        error: 'Data inválida',
        message: 'Formato de data inválido'
      });
    }

    // Validar duração
    if (duracao_dias < 1 || duracao_dias > 365) {
      return res.status(400).json({
        error: 'Duração inválida',
        message: 'Duração deve estar entre 1 e 365 dias'
      });
    }

    // Atualizar configuração
    const result = await pool.query(
      `UPDATE campanha_config 
       SET data_inicio = $1, duracao_dias = $2, updated_at = NOW() 
       WHERE ativa = true 
       RETURNING *`,
      [dataInicio.toISOString().split('T')[0], duracao_dias]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Configuração não encontrada',
        message: 'Nenhuma campanha ativa encontrada para atualizar'
      });
    }

    res.json({
      success: true,
      message: 'Configuração da campanha atualizada com sucesso',
      config: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar configuração da campanha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar configuração da campanha'
    });
  }
});

// Rota para avançar dia da campanha (apenas admin)
router.post('/advance-day', authenticateToken, async (req, res) => {
  try {
    // Buscar configuração atual
    const configResult = await pool.query(
      'SELECT * FROM campanha_config WHERE ativa = true ORDER BY id DESC LIMIT 1'
    );

    if (configResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Configuração não encontrada',
        message: 'Nenhuma campanha ativa encontrada'
      });
    }

    const config = configResult.rows[0];
    
    // Verificar se pode avançar
    if (config.current_day >= config.duracao_dias) {
      return res.status(400).json({
        error: 'Campanha finalizada',
        message: 'A campanha já chegou ao último dia'
      });
    }

    // Avançar dia
    const newDay = config.current_day + 1;
    const result = await pool.query(
      `UPDATE campanha_config 
       SET current_day = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [newDay, config.id]
    );

    res.json({
      success: true,
      message: `Dia avançado para ${newDay}`,
      config: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao avançar dia da campanha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao avançar dia da campanha'
    });
  }
});

// Rota para redefinir dia da campanha (apenas admin)
router.post('/reset-day', authenticateToken, async (req, res) => {
  try {
    const { day } = req.body;

    if (day === undefined || day < 0 || day > 10) {
      return res.status(400).json({
        error: 'Dia inválido',
        message: 'Dia deve estar entre 0 e 10'
      });
    }

    // Atualizar dia
    const result = await pool.query(
      `UPDATE campanha_config 
       SET current_day = $1, updated_at = NOW() 
       WHERE ativa = true 
       RETURNING *`,
      [day]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Configuração não encontrada',
        message: 'Nenhuma campanha ativa encontrada'
      });
    }

    res.json({
      success: true,
      message: `Dia redefinido para ${day}`,
      config: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao redefinir dia da campanha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao redefinir dia da campanha'
    });
  }
});

// Rota para obter status da campanha
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM campanha_config WHERE ativa = true ORDER BY id DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Configuração não encontrada',
        message: 'Nenhuma campanha ativa encontrada'
      });
    }

    const config = result.rows[0];
    const dataInicio = new Date(config.data_inicio);
    const dataAtual = new Date();
    const diffTime = dataAtual.getTime() - dataInicio.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let status = 'ativa';
    let diaAtual = config.current_day || 1;
    
    if (diffDays < 0) {
      status = 'aguardando';
      diaAtual = 0;
    } else if (diffDays >= config.duracao_dias) {
      status = 'finalizada';
      diaAtual = config.duracao_dias;
    }

    res.json({
      success: true,
      status: {
        status,
        diaAtual,
        diasRestantes: Math.max(0, config.duracao_dias - diaAtual),
        dataInicio: config.data_inicio,
        duracaoDias: config.duracao_dias,
        ativa: config.ativa
      }
    });

  } catch (error) {
    console.error('Erro ao buscar status da campanha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar status da campanha'
    });
  }
});

module.exports = router; 