const admin = require('firebase-admin');
const path = require('path');

console.log('🔧 Configurando Firebase Realtime Database...');

// Verificar se o arquivo serviceAccountKey.json existe
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
  console.log('✅ Arquivo serviceAccountKey.json encontrado');
} catch (error) {
  console.error('❌ Arquivo serviceAccountKey.json não encontrado');
  console.error('📝 Certifique-se de baixar o arquivo do Firebase Console');
  process.exit(1);
}

// Mostrar informações do projeto
console.log('📊 Informações do Projeto:');
console.log(`   Projeto ID: ${serviceAccount.project_id}`);
console.log(`   Client Email: ${serviceAccount.client_email}`);

// Configurar Firebase com URL correta
const databaseURL = `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`;
console.log(`🌐 URL do Database: ${databaseURL}`);

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: databaseURL
});

const db = admin.database();

// Testar conexão
const testConnection = async () => {
  try {
    console.log('🔄 Testando conexão...');
    await db.ref('.info/connected').once('value');
    console.log('✅ Conexão com Firebase Realtime Database estabelecida');
    
    // Testar escrita
    const testRef = db.ref('test_connection');
    await testRef.set({
      timestamp: admin.database.ServerValue.TIMESTAMP,
      message: 'Teste de conexão bem-sucedido'
    });
    console.log('✅ Escrita no Firebase testada com sucesso');
    
    // Limpar teste
    await testRef.remove();
    console.log('✅ Teste de conexão concluído');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com Firebase:', error);
    console.error('🔍 Verifique:');
    console.error('   1. Se o projeto Firebase existe');
    console.error('   2. Se o Realtime Database foi criado');
    console.error('   3. Se as regras de segurança permitem leitura/escrita');
    console.error('   4. Se o serviceAccountKey.json está correto');
    throw error;
  }
};

// Executar teste
testConnection()
  .then(() => {
    console.log('🎉 Firebase configurado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha na configuração:', error);
    process.exit(1);
  }); 