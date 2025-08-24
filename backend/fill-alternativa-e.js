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

async function fillAlternativaE() {
  try {
    console.log('🔧 Preenchendo alternativa_e com "TESTE" para todas as perguntas...');
    
    // Verificar se a coluna alternativa_e existe
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'questions' AND column_name = 'alternativa_e'
    `);
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Coluna alternativa_e não existe! Execute primeiro: node add-alternativa-e.js');
      return;
    }
    
    // Contar total de perguntas
    const countResult = await pool.query('SELECT COUNT(*) FROM questions');
    const totalQuestions = countResult.rows[0].count;
    console.log(`📊 Total de perguntas: ${totalQuestions}`);
    
    // Contar perguntas que já têm alternativa_e preenchida
    const filledResult = await pool.query(`
      SELECT COUNT(*) FROM questions WHERE alternativa_e IS NOT NULL
    `);
    const filledCount = filledResult.rows[0].count;
    console.log(`📝 Perguntas com alternativa_e preenchida: ${filledCount}`);
    
    // Atualizar todas as perguntas com alternativa_e = 'TESTE'
    const updateResult = await pool.query(`
      UPDATE questions 
      SET alternativa_e = 'TESTE' 
      WHERE alternativa_e IS NULL
    `);
    
    console.log(`✅ ${updateResult.rowCount} perguntas atualizadas com alternativa_e = 'TESTE'`);
    
    // Verificar resultado final
    const finalResult = await pool.query(`
      SELECT COUNT(*) FROM questions WHERE alternativa_e = 'TESTE'
    `);
    const finalCount = finalResult.rows[0].count;
    console.log(`📊 Total de perguntas com alternativa_e = 'TESTE': ${finalCount}`);
    
    // Mostrar exemplo de pergunta atualizada
    console.log('\n❓ Exemplo de pergunta atualizada:');
    const sampleQuestion = await pool.query(`
      SELECT id, pergunta, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, resposta_correta
      FROM questions 
      LIMIT 1
    `);
    
    if (sampleQuestion.rows.length > 0) {
      const q = sampleQuestion.rows[0];
      console.log('   Dados da primeira pergunta:');
      console.log(`     - ID: ${q.id}`);
      console.log(`     - Pergunta: ${q.pergunta.substring(0, 100)}...`);
      console.log(`     - A: ${q.alternativa_a}`);
      console.log(`     - B: ${q.alternativa_b}`);
      console.log(`     - C: ${q.alternativa_c}`);
      console.log(`     - D: ${q.alternativa_d}`);
      console.log(`     - E: ${q.alternativa_e}`);
      console.log(`     - Resposta Correta: ${q.resposta_correta}`);
    }
    
    // Verificar se todas as perguntas têm as 6 colunas preenchidas
    console.log('\n🔍 Verificando completude das alternativas:');
    const incompleteResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM questions 
      WHERE alternativa_a IS NULL 
         OR alternativa_b IS NULL 
         OR alternativa_c IS NULL 
         OR alternativa_d IS NULL 
         OR alternativa_e IS NULL
         OR resposta_correta IS NULL
    `);
    
    const incompleteCount = incompleteResult.rows[0].count;
    if (incompleteCount > 0) {
      console.log(`   ⚠️ ${incompleteCount} perguntas com alternativas incompletas`);
    } else {
      console.log(`   ✅ Todas as perguntas têm alternativas completas (A, B, C, D, E + resposta)`);
    }
    
    console.log('\n🎉 Processo concluído!');
    console.log('\n📋 Resumo:');
    console.log(`   - Total de perguntas: ${totalQuestions}`);
    console.log(`   - Alternativa E preenchida: ${finalCount}`);
    console.log(`   - Todas as perguntas agora têm 5 alternativas + resposta correta`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

fillAlternativaE();
