const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const pool = new Pool({
  user: config.DB_USER,
  host: config.DB_HOST,
  database: config.DB_NAME,
  password: config.DB_PASSWORD,
  port: config.DB_PORT || 5432,
  ssl: config.DB_SSL ? { rejectUnauthorized: false } : false,
});

async function importFromExport() {
  try {
    console.log('📥 Importando dados do arquivo exportado do Firebase...');
    
    // Ler o arquivo completo do Firebase
    const exportPath = './fgvdgpe-65c86-default-rtdb-export.json';
    
    if (!fs.existsSync(exportPath)) {
      throw new Error(`Arquivo não encontrado: ${exportPath}`);
    }
    
    console.log('📄 Arquivo encontrado, lendo dados...');
    
    // Ler o arquivo JSON diretamente
    const firebaseData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    
    console.log('📊 Estrutura dos dados:', Object.keys(firebaseData));
    
    // 1. Importar configuração da campanha
    if (firebaseData.campanha_config) {
      console.log('⚙️ Importando configuração da campanha...');
      const configData = firebaseData.campanha_config;
      
      // Usar apenas as colunas que existem na tabela
      const result = await pool.query(`
        INSERT INTO campanha_config (id, ativa, created_at, current_day, data_inicio, duracao_dias, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          ativa = EXCLUDED.ativa,
          current_day = EXCLUDED.current_day,
          data_inicio = EXCLUDED.data_inicio,
          duracao_dias = EXCLUDED.duracao_dias,
          updated_at = EXCLUDED.updated_at
        RETURNING id
      `, [
        configData.id,
        configData.ativa,
        configData.created_at,
        configData.current_day,
        configData.data_inicio,
        configData.duracao_dias,
        configData.updated_at
      ]);
      
      console.log('✅ Configuração da campanha importada!');
    }
    
    // 2. Importar perguntas
    if (firebaseData.perguntas) {
      console.log('❓ Importando perguntas...');
      let perguntasImportadas = 0;
      let totalPerguntas = firebaseData.perguntas.length;
      
      console.log(`📊 Total de perguntas no JSON: ${totalPerguntas}`);
      
      // Processar TODAS as perguntas (incluindo índice 0 que é null)
      for (let i = 0; i < firebaseData.perguntas.length; i++) {
        const pergunta = firebaseData.perguntas[i];
        if (!pergunta) {
          console.log(`⏭️ Pulando pergunta ${i} (null)`);
          continue;
        }
        
        try {
          // Mapear colunas do Firebase para as colunas da tabela
          const result = await pool.query(`
            INSERT INTO questions (id, pergunta, alternativa_a, alternativa_b, alternativa_c, alternativa_d, resposta_correta, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO UPDATE SET
              pergunta = EXCLUDED.pergunta,
              alternativa_a = EXCLUDED.alternativa_a,
              alternativa_b = EXCLUDED.alternativa_b,
              alternativa_c = EXCLUDED.alternativa_c,
              alternativa_d = EXCLUDED.alternativa_d,
              resposta_correta = EXCLUDED.resposta_correta
            RETURNING id
          `, [
            pergunta.id,
            pergunta.pergunta,
            pergunta.a1,
            pergunta.a2,
            pergunta.a3,
            pergunta.a4,
            pergunta.ac,
            new Date().toISOString()
          ]);
          
          perguntasImportadas++;
          console.log(`✅ Pergunta ${pergunta.id} importada: ${pergunta.pergunta.substring(0, 50)}...`);
        } catch (error) {
          console.log(`⚠️ Erro ao importar pergunta ${i} (ID: ${pergunta.id}):`, error.message);
        }
      }
      
      console.log(`✅ Perguntas importadas: ${perguntasImportadas}/${totalPerguntas - 1} (excluindo null)`);
    }
    
    // 3. Importar usuários
    if (firebaseData.users) {
      console.log('👥 Importando usuários...');
      let usuariosImportados = 0;
      let totalUsuarios = firebaseData.users.length;
      
      console.log(`📊 Total de usuários no JSON: ${totalUsuarios}`);
      
      // Processar TODOS os usuários (incluindo índice 0 que é null)
      for (let i = 0; i < firebaseData.users.length; i++) {
        const user = firebaseData.users[i];
        if (!user) {
          console.log(`⏭️ Pulando usuário ${i} (null)`);
          continue;
        }
        
        try {
          // Mapear colunas do Firebase para as colunas da tabela
          const result = await pool.query(`
            INSERT INTO users (
              id, login, turma, escola, serie, xp_atual, nivel_atual,
              id_q1, response_q1, id_q2, response_q2, id_q3, response_q3, id_q4, response_q4,
              id_q5, response_q5, id_q6, response_q6, id_q7, response_q7, id_q8, response_q8,
              id_q9, response_q9, id_q10, response_q10, last_response_timestamp, created_at, updated_at
            )
            VALUES (
              $1, $2, $3, $4, $5, $6, $7,
              $8, $9, $10, $11, $12, $13, $14, $15,
              $16, $17, $18, $19, $20, $21, $22, $23,
              $24, $25, $26, $27, $28, $29, $30
            )
            ON CONFLICT (id) DO UPDATE SET
              turma = EXCLUDED.turma,
              escola = EXCLUDED.escola,
              serie = EXCLUDED.serie,
              xp_atual = EXCLUDED.xp_atual,
              nivel_atual = EXCLUDED.nivel_atual,
              id_q1 = EXCLUDED.id_q1, response_q1 = EXCLUDED.response_q1,
              id_q2 = EXCLUDED.id_q2, response_q2 = EXCLUDED.response_q2,
              id_q3 = EXCLUDED.id_q3, response_q3 = EXCLUDED.response_q3,
              id_q4 = EXCLUDED.id_q4, response_q4 = EXCLUDED.response_q4,
              id_q5 = EXCLUDED.id_q5, response_q5 = EXCLUDED.response_q5,
              id_q6 = EXCLUDED.id_q6, response_q6 = EXCLUDED.response_q6,
              id_q7 = EXCLUDED.id_q7, response_q7 = EXCLUDED.response_q7,
              id_q8 = EXCLUDED.id_q8, response_q8 = EXCLUDED.response_q8,
              id_q9 = EXCLUDED.id_q9, response_q9 = EXCLUDED.response_q9,
              id_q10 = EXCLUDED.id_q10, response_q10 = EXCLUDED.response_q10,
              last_response_timestamp = EXCLUDED.last_response_timestamp,
              updated_at = EXCLUDED.updated_at
            RETURNING id
          `, [
            user.id,
            user.login || user.nome || `user_${user.id}`,
            user.turma || 'Turma Padrão',
            user.escola || 'Escola Padrão',
            user.serie || 'Série Padrão',
            user.xp_atual || 0,
            Math.floor((user.xp_atual || 0) / 100) + 1, // 100 XP por nível
            user.id_q1 || null, user.response_q1 || false,
            user.id_q2 || null, user.response_q2 || false,
            user.id_q3 || null, user.response_q3 || false,
            user.id_q4 || null, user.response_q4 || false,
            user.id_q5 || null, user.response_q5 || false,
            user.id_q6 || null, user.response_q6 || false,
            user.id_q7 || null, user.response_q7 || false,
            user.id_q8 || null, user.response_q8 || false,
            user.id_q9 || null, user.response_q9 || false,
            user.id_q10 || null, user.response_q10 || false,
            user.last_response_timestamp || null,
            new Date().toISOString(),
            new Date().toISOString()
          ]);
          
          usuariosImportados++;
          console.log(`✅ Usuário ${user.id} importado: ${user.nome || user.login} (${user.turma})`);
        } catch (error) {
          console.log(`⚠️ Erro ao importar usuário ${i} (ID: ${user.id}):`, error.message);
        }
      }
      
      console.log(`✅ Usuários importados: ${usuariosImportados}/${totalUsuarios - 1} (excluindo null)`);
    }
    
    console.log('🎉 Importação concluída com sucesso!');
    
    // Verificar dados importados
    console.log('📊 Verificando dados importados...');
    
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const questionsCount = await pool.query('SELECT COUNT(*) FROM questions');
    const configCount = await pool.query('SELECT COUNT(*) FROM campanha_config');
    
    console.log(`👥 Usuários: ${usersCount.rows[0].count}`);
    console.log(`❓ Perguntas: ${questionsCount.rows[0].count}`);
    console.log(`⚙️ Configurações: ${configCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Erro durante importação:', error.message);
  } finally {
    await pool.end();
  }
}

importFromExport();

