const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({
  user: config.DB_USER,
  host: config.DB_HOST,
  database: config.DB_NAME,
  password: config.DB_PASSWORD,
  port: config.DB_PORT || 5432,
  ssl: config.DB_SSL ? { rejectUnauthorized: false } : false,
});

async function createTables() {
  try {
    console.log('   Criando tabelas no PostgreSQL...');
    
    // Tabela de usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        login VARCHAR(50) UNIQUE NOT NULL,
        turma VARCHAR(100) NOT NULL,
        escola VARCHAR(200) NOT NULL,
        serie VARCHAR(50),
        xp_atual INTEGER DEFAULT 0,
        nivel_atual INTEGER DEFAULT 1,
        id_q1 INTEGER, response_q1 BOOLEAN DEFAULT FALSE,
        id_q2 INTEGER, response_q2 BOOLEAN DEFAULT FALSE,
        id_q3 INTEGER, response_q3 BOOLEAN DEFAULT FALSE,
        id_q4 INTEGER, response_q4 BOOLEAN DEFAULT FALSE,
        id_q5 INTEGER, response_q5 BOOLEAN DEFAULT FALSE,
        id_q6 INTEGER, response_q6 BOOLEAN DEFAULT FALSE,
        id_q7 INTEGER, response_q7 BOOLEAN DEFAULT FALSE,
        id_q8 INTEGER, response_q8 BOOLEAN DEFAULT FALSE,
        id_q9 INTEGER, response_q9 BOOLEAN DEFAULT FALSE,
        id_q10 INTEGER, response_q10 BOOLEAN DEFAULT FALSE,
        last_response_timestamp TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Tabela de configuração da campanha
    await pool.query(`
      CREATE TABLE IF NOT EXISTS campanha_config (
        id SERIAL PRIMARY KEY,
        data_inicio DATE NOT NULL,
        duracao_dias INTEGER DEFAULT 10,
        ativa BOOLEAN DEFAULT TRUE,
        current_day INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Tabela de questões
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        pergunta TEXT NOT NULL,
        imagem VARCHAR(500),
        alternativa_a TEXT NOT NULL,
        alternativa_b TEXT NOT NULL,
        alternativa_c TEXT NOT NULL,
        alternativa_d TEXT NOT NULL,
        resposta_correta INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Tabelas criadas com sucesso!');
    
    // Inserir dados de exemplo
    await insertSampleData();
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  } finally {
    await pool.end();
  }
}

async function insertSampleData() {
  try {
    console.log('   Inserindo dados de exemplo...');
    
    // Inserir configuração da campanha
    await pool.query(`
      INSERT INTO campanha_config (data_inicio, duracao_dias, ativa, current_day)
      VALUES ('2025-08-15', 10, true, 1)
      ON CONFLICT (id) DO NOTHING;
    `);
    
    // Inserir algumas questões de exemplo
    await pool.query(`
      INSERT INTO questions (pergunta, alternativa_a, alternativa_b, alternativa_c, alternativa_d, resposta_correta)
      VALUES 
        ('Qual é a capital da Bahia?', 'Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Ilhéus', 1),
        ('Em que ano o Brasil se tornou independente?', '1808', '1822', '1889', '1500', 2),
        ('Qual é o maior planeta do sistema solar?', 'Terra', 'Marte', 'Júpiter', 'Saturno', 3)
      ON CONFLICT (id) DO NOTHING;
    `);
    
    console.log('✅ Dados de exemplo inseridos!');
    
  } catch (error) {
    console.error('❌ Erro ao inserir dados:', error);
  }
}

createTables();