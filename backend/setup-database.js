const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Caminho para o banco de dados
const dbPath = path.join(__dirname, 'database', 'quiz.db');

console.log('🚀 Iniciando configuração completa do banco de dados...');

// Verificar se o banco existe e tem tamanho > 0
const dbExists = fs.existsSync(dbPath) && fs.statSync(dbPath).size > 0;

if (!dbExists) {
  console.log('📝 Banco de dados não existe ou está vazio. Criando schema inicial...');
  
  // Ler o schema SQL
  const schemaPath = path.join(__dirname, 'database', 'schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
  
  // Conectar ao banco e criar schema
  const db = new sqlite3.Database(dbPath);
  
  db.serialize(() => {
    console.log('🔧 Executando schema inicial...');
    
    // Executar cada comando SQL separadamente
    const commands = schemaSQL.split(';').filter(cmd => cmd.trim());
    
    commands.forEach((command, index) => {
      if (command.trim()) {
        db.run(command, (err) => {
          if (err) {
            console.error(`❌ Erro no comando ${index + 1}:`, err.message);
          } else {
            console.log(`✅ Comando ${index + 1} executado`);
          }
        });
      }
    });
    
    // Aguardar um pouco para os comandos terminarem
    setTimeout(() => {
      console.log('✅ Schema inicial criado com sucesso!');
      db.close();
      
      // Agora executar a migração
      console.log('🔄 Executando migração para 10 questões...');
      executeMigration();
    }, 2000);
  });
  
} else {
  console.log('✅ Banco de dados já existe. Executando migração...');
  executeMigration();
}

function executeMigration() {
  const db = new sqlite3.Database(dbPath);
  
  console.log('📝 Adicionando campos para questões 5-10...');
  
  // Adicionar campos para questões 5-10
  const addColumns = [
    'ALTER TABLE users ADD COLUMN id_q5 INTEGER',
    'ALTER TABLE users ADD COLUMN response_q5 BOOLEAN DEFAULT 0',
    'ALTER TABLE users ADD COLUMN id_q6 INTEGER',
    'ALTER TABLE users ADD COLUMN response_q6 BOOLEAN DEFAULT 0',
    'ALTER TABLE users ADD COLUMN id_q7 INTEGER',
    'ALTER TABLE users ADD COLUMN response_q7 BOOLEAN DEFAULT 0',
    'ALTER TABLE users ADD COLUMN id_q8 INTEGER',
    'ALTER TABLE users ADD COLUMN response_q8 BOOLEAN DEFAULT 0',
    'ALTER TABLE users ADD COLUMN id_q9 INTEGER',
    'ALTER TABLE users ADD COLUMN response_q9 BOOLEAN DEFAULT 0',
    'ALTER TABLE users ADD COLUMN id_q10 INTEGER',
    'ALTER TABLE users ADD COLUMN response_q10 BOOLEAN DEFAULT 0'
  ];

  addColumns.forEach((sql, index) => {
    db.run(sql, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error(`❌ Erro ao executar: ${sql}`, err.message);
      } else {
        console.log(`✅ Campo ${index + 1} adicionado ou já existe`);
      }
    });
  });

  console.log('⏰ Adicionando campo timestamp da última resposta...');
  
  // Adicionar timestamp da última resposta
  db.run('ALTER TABLE users ADD COLUMN last_response_timestamp DATETIME', (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('❌ Erro ao adicionar timestamp:', err.message);
    } else {
      console.log('✅ Campo timestamp adicionado ou já existe');
    }
  });

  console.log('🔄 Atualizando usuários existentes...');
  
  // Para usuários existentes, duplicar questões para preencher os novos campos
  db.run(`
    UPDATE users SET 
      id_q5 = id_q1,
      id_q6 = id_q2,
      id_q7 = id_q3,
      id_q8 = id_q4,
      id_q9 = id_q1,
      id_q10 = id_q2
    WHERE id_q1 IS NOT NULL
  `, (err) => {
    if (err) {
      console.error('❌ Erro ao atualizar usuários:', err.message);
    } else {
      console.log('✅ Usuários atualizados com questões duplicadas');
    }
  });

  console.log('📊 Atualizando configuração da campanha...');
  
  // Atualizar configuração da campanha para 10 dias úteis
  db.run('UPDATE campanha_config SET duracao_dias = 10 WHERE id = 1', (err) => {
    if (err) {
      console.error('❌ Erro ao atualizar configuração:', err.message);
    } else {
      console.log('✅ Configuração da campanha atualizada para 10 dias');
    }
  });

  console.log('🔍 Criando índices para melhor performance...');
  
  // Criar índices para melhor performance
  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_users_questions ON users(id_q1, id_q2, id_q3, id_q4, id_q5, id_q6, id_q7, id_q8, id_q9, id_q10)',
    'CREATE INDEX IF NOT EXISTS idx_users_responses ON users(response_q1, response_q2, response_q3, response_q4, response_q5, response_q6, response_q7, response_q8, response_q9, response_q10)',
    'CREATE INDEX IF NOT EXISTS idx_users_last_response ON users(last_response_timestamp)'
  ];

  createIndexes.forEach((sql, index) => {
    db.run(sql, (err) => {
      if (err) {
        console.error(`❌ Erro ao criar índice ${index + 1}:`, err.message);
      } else {
        console.log(`✅ Índice ${index + 1} criado ou já existe`);
      }
    });
  });

  // Verificar estrutura final
  console.log('🔍 Verificando estrutura final...');
  db.all("PRAGMA table_info(users)", (err, rows) => {
    if (err) {
      console.error('❌ Erro ao verificar estrutura:', err.message);
    } else {
      console.log('📋 Estrutura da tabela users:');
      rows.forEach(row => {
        if (row.name.includes('q') || row.name.includes('timestamp')) {
          console.log(`  - ${row.name}: ${row.type}`);
        }
      });
    }
    
    console.log('✅ Migração concluída!');
    db.close();
  });
}


