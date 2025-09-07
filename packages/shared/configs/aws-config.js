// Configurações compartilhadas da AWS
const config = {
  // Região AWS
  region: 'us-east-2',
  
  // Configurações do RDS
  rds: {
    host: process.env.DB_HOST || 'game-postgres.chykacyyar03.us-east-2.rds.amazonaws.com',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'ZIGOMES',
    password: process.env.DB_PASSWORD || 'Vampiro5!',
    ssl: true
  },
  
  // Configurações JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'ga_quiz_secret_key_2024_bahia_education_postgresql',
    expiresIn: '24h'
  },
  
  // Configurações Firebase
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  },
  
  // Configurações do ambiente
  environment: {
    nodeEnv: process.env.NODE_ENV || 'production',
    isOffline: process.env.IS_OFFLINE === 'true'
  },
  
  // Configurações de rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000
  }
};

module.exports = config;

