const { Pool } = require('pg');
const config = require('../config');

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  user: config.DB_USER,
  host: config.DB_HOST,
  database: config.DB_NAME,
  password: config.DB_PASSWORD,
  port: config.DB_PORT || 5432,
  ssl: config.DB_SSL ? { rejectUnauthorized: false } : false,
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000, // Tempo limite de conexões ociosas
  connectionTimeoutMillis: 2000, // Tempo limite para estabelecer conexão
});

// Eventos do pool
pool.on('connect', (client) => {
  if (config.LOG_QUERIES) {
    console.log('🔌 Nova conexão PostgreSQL estabelecida');
  }
});

pool.on('error', (err, client) => {
  console.error('❌ Erro inesperado no cliente PostgreSQL:', err);
});

// Função para testar conexão
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    client.release();
    
    console.log('✅ Conexão PostgreSQL OK');
    console.log(`🕐 Hora atual: ${result.rows[0].current_time}`);
    console.log(`📊 Versão: ${result.rows[0].db_version.split(' ')[0]}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL:', error.message);
    throw error;
  }
}

// Função para executar query com retorno
async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (config.LOG_QUERIES) {
      console.log(`📊 Query executada em ${duration}ms:`, text.substring(0, 100) + '...');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Erro na query:', error.message);
    console.error('📝 Query:', text);
    console.error('🔢 Parâmetros:', params);
    throw error;
  }
}

// Função para executar query sem retorno
async function execute(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (config.LOG_QUERIES) {
      console.log(`📊 Execute em ${duration}ms:`, text.substring(0, 100) + '...');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Erro no execute:', error.message);
    console.error('📝 Query:', text);
    console.error('🔢 Parâmetros:', params);
    throw error;
  }
}

// Função para obter cliente individual (para transações)
async function getClient() {
  return await pool.connect();
}

// Função para fechar pool (usar apenas no shutdown)
async function closePool() {
  await pool.end();
  console.log('🔌 Pool PostgreSQL fechado');
}

// Funções específicas do sistema

// Buscar todos os usuários
async function getUsers() {
  try {
    const result = await query(`
      SELECT 
        id, login, turma, escola, serie, xp_atual, nivel_atual,
        id_q1, response_q1, id_q2, response_q2, id_q3, response_q3, id_q4, response_q4,
        id_q5, response_q5, id_q6, response_q6, id_q7, response_q7, id_q8, response_q8,
        id_q9, response_q9, id_q10, response_q10, last_response_timestamp,
        created_at, updated_at
      FROM users 
      ORDER BY xp_atual DESC
    `);
    
    // Converter para formato compatível com o sistema atual
    const users = {};
    result.rows.forEach(row => {
      users[row.id] = {
        id: row.id,
        login: row.login,
        turma: row.turma,
        escola: row.escola,
        serie: row.serie,
        xp_atual: row.xp_atual,
        nivel_atual: row.nivel_atual,
        id_q1: row.id_q1,
        response_q1: row.response_q1,
        id_q2: row.id_q2,
        response_q2: row.response_q2,
        id_q3: row.id_q3,
        response_q3: row.response_q3,
        id_q4: row.id_q4,
        response_q4: row.response_q4,
        id_q5: row.id_q5,
        response_q5: row.response_q5,
        id_q6: row.id_q6,
        response_q6: row.response_q6,
        id_q7: row.id_q7,
        response_q7: row.response_q7,
        id_q8: row.id_q8,
        response_q8: row.response_q8,
        id_q9: row.id_q9,
        response_q9: row.response_q9,
        id_q10: row.id_q10,
        response_q10: row.response_q10,
        last_response_timestamp: row.last_response_timestamp,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    });
    
    return users;
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    throw error;
  }
}

// Buscar usuário por ID
async function getUserById(id) {
  try {
    const result = await query(`
      SELECT 
        id, login, turma, escola, serie, xp_atual, nivel_atual,
        id_q1, response_q1, id_q2, response_q2, id_q3, response_q3, id_q4, response_q4,
        id_q5, response_q5, id_q6, response_q6, id_q7, response_q7, id_q8, response_q8,
        id_q9, response_q9, id_q10, response_q10, last_response_timestamp,
        created_at, updated_at
      FROM users 
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      login: row.login,
      turma: row.turma,
      escola: row.escola,
      serie: row.serie,
      xp_atual: row.xp_atual,
      nivel_atual: row.nivel_atual,
      id_q1: row.id_q1,
      response_q1: row.response_q1,
      id_q2: row.id_q2,
      response_q2: row.response_q2,
      id_q3: row.id_q3,
      response_q3: row.response_q3,
      id_q4: row.id_q4,
      response_q4: row.response_q4,
      id_q5: row.id_q5,
      response_q5: row.response_q5,
      id_q6: row.id_q6,
      response_q6: row.response_q6,
      id_q7: row.id_q7,
      response_q7: row.response_q7,
      id_q8: row.id_q8,
      response_q8: row.response_q8,
      id_q9: row.id_q9,
      response_q9: row.response_q9,
      id_q10: row.id_q10,
      response_q10: row.response_q10,
      last_response_timestamp: row.last_response_timestamp,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  } catch (error) {
    console.error('❌ Erro ao buscar usuário por ID:', error);
    throw error;
  }
}

// Atualizar usuário
async function updateUser(id, updates) {
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    // Construir query dinamicamente
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'created_at') { // Não permitir atualizar ID ou created_at
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }
    
    // Adicionar updated_at automaticamente
    fields.push('updated_at = CURRENT_TIMESTAMP');
    
    // Adicionar ID no final
    values.push(id);
    
    const queryText = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await execute(queryText, values);
    
    if (result.rowCount === 0) {
      throw new Error('Usuário não encontrado');
    }
    
    console.log(`✅ Usuário ${id} atualizado com sucesso`);
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    throw error;
  }
}

// Buscar configuração da campanha
async function getCampanhaConfig() {
  try {
    const result = await query(`
      SELECT id, data_inicio, duracao_dias, ativa, current_day, created_at, updated_at
      FROM campanha_config 
      ORDER BY id DESC 
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      data_inicio: row.data_inicio,
      duracao_dias: row.duracao_dias,
      ativa: row.ativa,
      current_day: row.current_day,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  } catch (error) {
    console.error('❌ Erro ao buscar configuração da campanha:', error);
    throw error;
  }
}

// Atualizar configuração da campanha
async function updateCampanhaConfig(config) {
  try {
    const result = await execute(`
      INSERT INTO campanha_config (data_inicio, duracao_dias, ativa, current_day, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        data_inicio = EXCLUDED.data_inicio,
        duracao_dias = EXCLUDED.duracao_dias,
        ativa = EXCLUDED.ativa,
        current_day = EXCLUDED.current_day,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      config.data_inicio,
      config.duracao_dias,
      config.ativa,
      config.current_day,
      config.created_at || new Date().toISOString(),
      new Date().toISOString()
    ]);
    
    console.log('✅ Configuração da campanha atualizada');
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Erro ao atualizar configuração da campanha:', error);
    throw error;
  }
}

// Buscar questões disponíveis
async function getAvailableQuestions() {
  try {
    const result = await query(`
      SELECT id, pergunta, imagem, alternativa_a, alternativa_b, alternativa_c, alternativa_d
      FROM questions 
      ORDER BY id
    `);
    
    return result.rows;
  } catch (error) {
    console.error('❌ Erro ao buscar questões:', error);
    throw error;
  }
}

// Buscar questão por ID
async function getQuestionById(id) {
  try {
    const result = await query(`
      SELECT id, pergunta, imagem, alternativa_a, alternativa_b, alternativa_c, alternativa_d, resposta_correta
      FROM questions 
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('❌ Erro ao buscar questão por ID:', error);
    throw error;
  }
}

// Estatísticas do sistema
async function getSystemStats() {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN xp_atual > 0 THEN 1 END) as active_users,
        AVG(xp_atual) as avg_xp,
        MAX(xp_atual) as max_xp,
        SUM(CASE WHEN response_q1 THEN 1 ELSE 0 END) as q1_responses,
        SUM(CASE WHEN response_q2 THEN 1 ELSE 0 END) as q2_responses,
        SUM(CASE WHEN response_q3 THEN 1 ELSE 0 END) as q3_responses,
        SUM(CASE WHEN response_q4 THEN 1 ELSE 0 END) as q4_responses,
        SUM(CASE WHEN response_q5 THEN 1 ELSE 0 END) as q5_responses,
        SUM(CASE WHEN response_q6 THEN 1 ELSE 0 END) as q6_responses,
        SUM(CASE WHEN response_q7 THEN 1 ELSE 0 END) as q7_responses,
        SUM(CASE WHEN response_q8 THEN 1 ELSE 0 END) as q8_responses,
        SUM(CASE WHEN response_q9 THEN 1 ELSE 0 END) as q9_responses,
        SUM(CASE WHEN response_q10 THEN 1 ELSE 0 END) as q10_responses
      FROM users
    `);
    
    return result.rows[0];
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas do sistema:', error);
    throw error;
  }
}

module.exports = {
  // Funções de conexão
  testConnection,
  query,
  execute,
  getClient,
  closePool,
  
  // Funções do sistema
  getUsers,
  getUserById,
  updateUser,
  getCampanhaConfig,
  updateCampanhaConfig,
  getAvailableQuestions,
  getQuestionById,
  getSystemStats,
  
  // Pool para uso direto se necessário
  pool
};
