const express = require('express');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../database/connection');

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
    const configs = await executeQuery(
      'SELECT * FROM campanha_config WHERE ativa = 1 ORDER BY id DESC LIMIT 1'
    );

    if (configs.length === 0) {
      return res.status(404).json({
        error: 'Configuração não encontrada',
        message: 'Nenhuma campanha ativa encontrada'
      });
    }

    const config = configs[0];
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
    if (duracao_dias < 1 || duracao_dias > 30) {
      return res.status(400).json({
        error: 'Duração inválida',
        message: 'Duração deve estar entre 1 e 30 dias'
      });
    }

    // Desativar campanhas anteriores
    await executeQuery('UPDATE campanha_config SET ativa = 0');

    // Inserir nova configuração
    await executeQuery(`
      INSERT INTO campanha_config (data_inicio, duracao_dias, ativa)
      VALUES (?, ?, 1)
    `, [data_inicio, duracao_dias]);

    res.json({
      success: true,
      message: 'Configuração da campanha atualizada com sucesso',
      config: {
        data_inicio,
        duracao_dias,
        ativo: 1
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar configuração da campanha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar configuração da campanha'
    });
  }
});

// Rota para obter logs de segurança (apenas admin)
router.get('/security-logs', authenticateToken, async (req, res) => {
  try {
    const logs = await executeQuery(`
      SELECT 
        sl.*,
        u.login as user_login,
        u.turma,
        u.escola
      FROM security_logs sl
      LEFT JOIN users u ON sl.user_id = u.id
      ORDER BY sl.created_at DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      logs: logs
    });

  } catch (error) {
    console.error('Erro ao buscar logs de segurança:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar logs de segurança'
    });
  }
});

module.exports = router; 