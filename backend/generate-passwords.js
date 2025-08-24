const bcrypt = require('bcryptjs');
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

async function generatePasswords() {
  try {
    console.log('🔐 Gerando senhas para usuários...');
    
    // Verificar se a coluna senha existe
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'senha'
    `);
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Coluna senha não existe! Execute primeiro: node add-senha-column.js');
      return;
    }
    
    // Buscar todos os usuários
    const result = await pool.query('SELECT id, login FROM users');
    const users = result.rows;
    
    console.log(`👥 Encontrados ${users.length} usuários`);
    
    // Gerar senha padrão para cada usuário
    for (const user of users) {
      const senhaPadrao = '123456'; // Senha padrão
      const senhaHash = await bcrypt.hash(senhaPadrao, 10);
      
      // Atualizar usuário com senha
      await pool.query(
        'UPDATE users SET senha = $1 WHERE id = $2',
        [senhaHash, user.id]
      );
      
      console.log(`✅ Usuário ${user.login}: senha ${senhaPadrao}`);
    }
    
    console.log('\n🎉 Todas as senhas foram geradas!');
    console.log('📝 Senha padrão para todos: 123456');
    console.log('\n🔑 Agora você pode fazer login com:');
    console.log('   - Login: qualquer usuário (ex: TESTE)');
    console.log('   - Senha: 123456');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

generatePasswords();
