const fs = require('fs');
const path = require('path');

try {
  // Ler o arquivo serviceAccountKey.json
  const serviceAccountPath = path.join(__dirname, 'backend', 'serviceAccountKey.json');
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  // Extrair a chave privada
  const privateKey = serviceAccount.private_key;
  
  // Formatar para uso no DigitalOcean
  const formattedKey = privateKey.replace(/\n/g, '\\n');
  
  console.log('🔑 Chave privada do Firebase formatada:');
  console.log('='.repeat(50));
  console.log(`"${formattedKey}"`);
  console.log('='.repeat(50));
  console.log('');
  console.log('📋 Copie esta chave e cole na variável FIREBASE_PRIVATE_KEY no DigitalOcean');
  console.log('');
  console.log('📊 Informações do projeto:');
  console.log(`   Projeto ID: ${serviceAccount.project_id}`);
  console.log(`   Client Email: ${serviceAccount.client_email}`);
  console.log(`   Database URL: https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`);
  
} catch (error) {
  console.error('❌ Erro ao ler serviceAccountKey.json:', error.message);
  console.log('📝 Certifique-se de que o arquivo existe em backend/serviceAccountKey.json');
} 