const { Pool } = require('pg');
const fs = require('fs');
const config = require('./config');

const pool = new Pool({
  user: config.DB_USER,
  host: config.DB_HOST,
  database: config.DB_NAME,
  password: config.DB_PASSWORD,
  port: config.DB_PORT || 5432,
  ssl: config.DB_SSL ? { rejectUnauthorized: false } : false,
});

async function importData() {
  try {
    console.log('📥 Importando dados para PostgreSQL...');
    
    // 1. Importar usuários
    if (fs.existsSync('firebase-users.json')) {
      console.log('👥 Importando usuários...');
      const users = JSON.parse(fs.readFileSync('firebase-users.json', 'utf8'));
      
      for (const [id, user] of Object.entries(users)) {
        await pool.query(`
          INSERT INTO users (
            id, login, turma, escola, serie, xp_atual, nivel_atual,
            id_q1, response_q1, id_q2, response_q2, id_q3, response_q3, id_q4, response_q4,
            id_q5, response_q5, id_q6, response_q6, id_q7, response_q7, id_q8, response_q8,
            id_q9, response_q9, id_q10, response_q10, last_response_timestamp
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
          ON CONFLICT (id) DO UPDATE SET
            login = EXCLUDED.login,
            turma = EXCLUDED.turma,
            escola = EXCLUDED.escola,
            serie = EXCLUDED.serie,
            xp_atual = EXCLUDED.xp_atual,
            nivel_atual = EXCLUDED.nivel_atual,
            id_q1 = EXCLUDED.id_q1,
            response_q1 = EXCLUDED.response_q1,
            id_q2 = EXCLUDED.id_q2,
            response_q2 = EXCLUDED.response_q2,
            id_q3 = EXCLUDED.id_q3,
            response_q3 = EXCLUDED.response_q3,
            id_q4 = EXCLUDED.id_q4,
            response_q4 = EXCLUDED.response_q4,
            id_q5 = EXCLUDED.id_q5,
            response_q5 = EXCLUDED.response_q5,
            id_q6 = EXCLUDED.id_q6,
            response_q6 = EXCLUDED.response_q6,
            id_q7 = EXCLUDED.id_q7,
            response_q7 = EXCLUDED.response_q7,
            id_q8 = EXCLUDED.id_q8,
            response_q8 = EXCLUDED.response_q8,
            id_q9 = EXCLUDED.id_q9,
            response_q9 = EXCLUDED.response_q9,
            id_q10 = EXCLUDED.id_q10,
            response_q10 = EXCLUDED.response_q10,
            last_response_timestamp = EXCLUDED.last_response_timestamp,
            updated_at = CURRENT_TIMESTAMP
        `, [
          parseInt(id), user.login, user.turma, user.escola, user.serie,
          user.xp_atual || 0, user.nivel_atual || 1,
          user.id_q1, user.response_q1 || false,
          user.id_q2, user.response_q2 || false,
          user.id_q3, user.response_q3 || false,
          user.id_q4, user.response_q4 || false,
          user.id_q5, user.response_q5 || false,
          user.id_q6, user.response_q6 || false,
          user.id_q7, user.response_q7 || false,
          user.id_q8, user.response_q8 || false,
          user.id_q9, user.response_q9 || false,
          user.id_q10, user.response_q10 || false,
          user.last_response_timestamp
        ]);
        
        console.log(`✅ Usuário ${user.login} importado`);
      }
    }
    
    // 2. Importar configuração da campanha
    if (fs.existsSync('firebase-campanha-config.json')) {
      console.log('⚙️ Importando configuração da campanha...');
      const campanhaConfig = JSON.parse(fs.readFileSync('firebase-campanha-config.json', 'utf8'));
      const config = Object.values(campanhaConfig)[0];
      
      await pool.query(`
        INSERT INTO campanha_config (data_inicio, duracao_dias, ativa, current_day)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          data_inicio = EXCLUDED.data_inicio,
          duracao_dias = EXCLUDED.duracao_dias,
          ativa = EXCLUDED.ativa,
          current_day = EXCLUDED.current_day,
          updated_at = CURRENT_TIMESTAMP
      `, [config.data_inicio, config.duracao_dias || 10, config.ativa, config.current_day]);
      
      console.log('✅ Configuração da campanha importada');
    }
    
    // 3. Importar questões
    if (fs.existsSync('firebase-questions.json')) {
      console.log('❓ Importando questões...');
      const questions = JSON.parse(fs.readFileSync('firebase-questions.json', 'utf8'));
      
      for (const [id, question] of Object.entries(questions)) {
        await pool.query(`
          INSERT INTO questions (id, pergunta, imagem, alternativa_a, alternativa_b, alternativa_c, alternativa_d, resposta_correta)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            pergunta = EXCLUDED.pergunta,
            imagem = EXCLUDED.imagem,
            alternativa_a = EXCLUDED.alternativa_a,
            alternativa_b = EXCLUDED.alternativa_b,
            alternativa_c = EXCLUDED.alternativa_c,
            alternativa_d = EXCLUDED.alternativa_d,
            resposta_correta = EXCLUDED.resposta_correta
        `, [
          parseInt(id), question.pergunta, question.imagem || null,
          question.alternativa_a, question.alternativa_b, question.alternativa_c, question.alternativa_d,
          question.resposta_correta
        ]);
        
        console.log(`✅ Questão ${id} importada`);
      }
    }