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

async function addMissingColumns() {
  try {
    console.log('🔧 Adicionando colunas faltantes à tabela users...');
    
    // Lista de colunas que precisam ser adicionadas
    const missingColumns = [
      { name: 'erros', type: 'INTEGER', default: '0' },
      { name: 'respostas_incorretas', type: 'INTEGER', default: '0' },
      { name: 'respostas_atrasadas', type: 'INTEGER', default: '0' }
    ];
    
    for (const column of missingColumns) {
      try {
        // Verificar se a coluna já existe
        const checkResult = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = $1
        `, [column.name]);
        
        if (checkResult.rows.length > 0) {
          console.log(`✅ Coluna ${column.name} já existe!`);
          continue;
        }
        
        // Adicionar coluna
        const alterQuery = `ALTER TABLE users ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default}`;
        await pool.query(alterQuery);
        
        console.log(`✅ Coluna ${column.name} adicionada com sucesso!`);
        
      } catch (error) {
        console.log(`⚠️ Erro ao adicionar coluna ${column.name}:`, error.message);
      }
    }
    
    // Verificar estrutura atualizada
    console.log('\n📋 Verificando estrutura atualizada...');
    const structureResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estrutura final da tabela users:');
    structureResult.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL';
      const defaultValue = col.column_default ? ` (default: ${col.column_default})` : '';
      console.log(`   - ${col.column_name}: ${col.data_type} - ${nullable}${defaultValue}`);
    });
    
    // Verificar se todas as colunas necessárias existem
    const requiredColumns = [
      'id', 'login', 'turma', 'escola', 'serie', 'xp_atual', 'nivel_atual',
      'id_q1', 'response_q1', 'id_q2', 'response_q2', 'id_q3', 'response_q3',
      'id_q4', 'response_q4', 'id_q5', 'response_q5', 'id_q6', 'response_q6',
      'id_q7', 'response_q7', 'id_q8', 'response_q8', 'id_q9', 'response_q9',
      'id_q10', 'response_q10', 'last_response_timestamp', 'created_at', 'updated_at',
      'senha', 'erros', 'respostas_incorretas', 'respostas_atrasadas'
    ];
    
    console.log('\n🔍 Verificação final das colunas:');
    const existingColumns = structureResult.rows.map(col => col.column_name);
    
    requiredColumns.forEach(col => {
      if (existingColumns.includes(col)) {
        console.log(`   ✅ ${col}`);
      } else {
        console.log(`   ❌ ${col} - AINDA FALTANDO!`);
      }
    });
    
    console.log('\n🎉 Processo concluído!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

addMissingColumns();
