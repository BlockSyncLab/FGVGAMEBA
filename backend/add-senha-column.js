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

async function addSenhaColumn() {
  try {
    console.log('🔧 Adicionando coluna senha à tabela users...');
    
    // Verificar se a coluna já existe
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'senha'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Coluna senha já existe!');
      return;
    }
    
    // Adicionar coluna senha
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN senha VARCHAR(255)
    `);
    
    console.log('✅ Coluna senha adicionada com sucesso!');
    
    // Verificar estrutura atualizada
    const structureResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estrutura atualizada da tabela users:');
    structureResult.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna:', error.message);
  } finally {
    await pool.end();
  }
}

addSenhaColumn();
