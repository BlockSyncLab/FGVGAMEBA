const admin = require('firebase-admin');
const path = require('path');

// Configuração do Firebase Admin SDK
let serviceAccount;
try {
  serviceAccount = require('../serviceAccountKey.json');
} catch (error) {
  console.error('❌ Arquivo serviceAccountKey.json não encontrado');
  console.error('📝 Certifique-se de baixar o arquivo do Firebase Console');
  process.exit(1);
}

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
});

// Obter referência do Realtime Database
const db = admin.database();

// Função para testar conexão
const testConnection = async () => {
  try {
    await db.ref('.info/connected').once('value');
    console.log('✅ Conexão com Firebase Realtime Database estabelecida');
    return 'Conexão com Firebase Realtime Database estabelecida com sucesso';
  } catch (error) {
    console.error('❌ Erro ao conectar com Firebase:', error);
    throw error;
  }
};

// Função para executar queries (simulando interface do SQLite)
const executeQuery = async (sql, params = []) => {
  console.log('⚠️ executeQuery não é suportado no Firebase Realtime Database');
  console.log('📝 Use as funções específicas do Firebase:');
  console.log('   - getUsers()');
  console.log('   - getUserById(id)');
  console.log('   - updateUser(id, data)');
  console.log('   - getQuestions()');
  console.log('   - getCampanhaConfig()');
  throw new Error('executeQuery não é suportado no Firebase Realtime Database');
};

// Funções específicas para usuários
const getUsers = async () => {
  const snapshot = await db.ref('users').once('value');
  return snapshot.val() || {};
};

const getUserById = async (id) => {
  const snapshot = await db.ref(`users/${id}`).once('value');
  return snapshot.val();
};

const createUser = async (userData, customId = null) => {
  if (customId) {
    // Usar ID personalizado
    await db.ref(`users/${customId}`).set(userData);
    return customId;
  } else {
    // Usar ID automático (comportamento padrão)
    const newUserRef = db.ref('users').push();
    await newUserRef.set(userData);
    return newUserRef.key;
  }
};

const updateUser = async (id, updates) => {
  await db.ref(`users/${id}`).update(updates);
};

// Funções específicas para perguntas
const getQuestions = async () => {
  const snapshot = await db.ref('perguntas').once('value');
  return snapshot.val() || {};
};

const getQuestionById = async (id) => {
  const snapshot = await db.ref(`perguntas/${id}`).once('value');
  return snapshot.val();
};

// Funções específicas para campanha
const getCampanhaConfig = async () => {
  const snapshot = await db.ref('campanha_config').once('value');
  return snapshot.val() || {};
};

const updateCampanhaConfig = async (config) => {
  await db.ref('campanha_config').set(config);
};

// Funções para logs de segurança
const logSecurityViolation = async (userId, action, details, req) => {
  const logData = {
    user_id: userId,
    action: action,
    details: details,
    ip_address: req?.ip || 'N/A',
    user_agent: req?.headers['user-agent'] || 'N/A',
    timestamp: admin.database.ServerValue.TIMESTAMP
  };
  
  await db.ref('security_logs').push(logData);
};

module.exports = {
  db,
  testConnection,
  executeQuery,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  getQuestions,
  getQuestionById,
  getCampanhaConfig,
  updateCampanhaConfig,
  logSecurityViolation
}; 