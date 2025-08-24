const admin = require('firebase-admin');
const fs = require('fs');

// Configurar Firebase
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fgv-quiz-default-rtdb.firebaseio.com"
});

const db = admin.database();

async function exportData() {
  try {
    console.log('📤 Exportando dados do Firebase...');
    
    // 1. Exportar usuários
    console.log('👥 Exportando usuários...');
    const usersSnapshot = await db.ref('users').once('value');
    const users = usersSnapshot.val();
    
    if (users) {
      fs.writeFileSync('firebase-users.json', JSON.stringify(users, null, 2));
      console.log(`✅ ${Object.keys(users).length} usuários exportados para firebase-users.json`);
    }
    
    // 2. Exportar configuração da campanha
    console.log('⚙️ Exportando configuração da campanha...');
    const configSnapshot = await db.ref('campanha_config').once('value');
    const campanhaConfig = configSnapshot.val();
    
    if (campanhaConfig) {
      fs.writeFileSync('firebase-campanha-config.json', JSON.stringify(campanhaConfig, null, 2));
      console.log('✅ Configuração da campanha exportada para firebase-campanha-config.json');
    }
    
    // 3. Exportar questões
    console.log('❓ Exportando questões...');
    const questionsSnapshot = await db.ref('questions').once('value');
    const questions = questionsSnapshot.val();
    
    if (questions) {
      fs.writeFileSync('firebase-questions.json', JSON.stringify(questions, null, 2));
      console.log(`✅ ${Object.keys(questions).length} questões exportadas para firebase-questions.json`);
    }
    
    console.log('🎉 Exportação concluída com sucesso!');
    console.log('📁 Arquivos criados:');
    console.log('   - firebase-users.json');
    console.log('   - firebase-campanha-config.json');
    console.log('   - firebase-questions.json');
    
  } catch (error) {
    console.error('❌ Erro durante exportação:', error);
  } finally {
    process.exit(0);
  }
}

exportData();