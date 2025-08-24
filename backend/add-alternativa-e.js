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

async function addAlternativaE() {
  try {
    console.log('🔧 Adicionando coluna alternativa_e à tabela questions...');
    
    // Verificar se a coluna já existe
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'questions' AND column_name = 'alternativa_e'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Coluna alternativa_e já existe!');
    } else {
      // Adicionar coluna alternativa_e
      await pool.query(`
        ALTER TABLE questions 
        ADD COLUMN alternativa_e TEXT
      `);
      
      console.log('✅ Coluna alternativa_e adicionada com sucesso!');
    }
    
    // Verificar estrutura atualizada
    console.log('\n📋 Verificando estrutura atualizada...');
    const structureResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'questions' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estrutura final da tabela questions:');
    structureResult.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL';
      const defaultValue = col.column_default ? ` (default: ${col.column_default})` : '';
      console.log(`   - ${col.column_name}: ${col.data_type} - ${nullable}${defaultValue}`);
    });
    
    // Verificar se todas as 6 colunas necessárias existem
    const requiredColumns = [
      'alternativa_a', 'alternativa_b', 'alternativa_c', 'alternativa_d', 'alternativa_e', 'resposta_correta'
    ];
    
    console.log('\n🔍 Verificação final das alternativas:');
    const existingColumns = structureResult.rows.map(col => col.column_name);
    
    requiredColumns.forEach(col => {
      if (existingColumns.includes(col)) {
        console.log(`   ✅ ${col}`);
      } else {
        console.log(`   ❌ ${col} - FALTANDO!`);
      }
    });
    
    // Verificar dados de uma pergunta
    console.log('\n❓ Verificando dados de uma pergunta:');
    const questionResult = await pool.query(`
      SELECT id, pergunta, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, resposta_correta
      FROM questions 
      LIMIT 1
    `);
    
    if (questionResult.rows.length > 0) {
      const q = questionResult.rows[0];
      console.log('   Dados da primeira pergunta:');
      console.log(`     - ID: ${q.id}`);
      console.log(`     - Pergunta: ${q.pergunta.substring(0, 100)}...`);
      console.log(`     - A: ${q.alternativa_a}`);
      console.log(`     - B: ${q.alternativa_b}`);
      console.log(`     - C: ${q.alternativa_c}`);
      console.log(`     - D: ${q.alternativa_d}`);
      console.log(`     - E: ${q.alternativa_e || 'NULL (precisa ser preenchida)'}`);
      console.log(`     - Resposta Correta: ${q.resposta_correta}`);
    }
    
    console.log('\n🎉 Processo concluído!');
    console.log('\n⚠️ IMPORTANTE: Agora você precisa:');
    console.log('   1. Preencher a coluna alternativa_e com os dados da base anterior');
    console.log('   2. Atualizar o frontend para exibir 5 alternativas');
    console.log('   3. Atualizar o backend para processar 5 alternativas');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

addAlternativaE();
