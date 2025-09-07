#!/usr/bin/env node

/**
 * Script para limpar configurações pessoais e preparar para deploy na empresa
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Limpando configurações pessoais...');

// Arquivos que contêm configurações específicas
const filesToClean = [
  'backend/serverless.yml',
  'backend/config.js',
  'frontend/src/services/api.ts',
  'backend/config.env',
  'backend/config.production.env'
];

// Configurações que devem ser substituídas
const replacements = [
  {
    file: 'backend/serverless.yml',
    patterns: [
      { from: 'ga-quiz-backend', to: '[NOME_PROJETO]-backend' },
      { from: 'us-east-2', to: '[REGIAO_EMPRESA]' },
      { from: '/ga-quiz/', to: '/[PREFIXO_SSM]/' },
      { from: '347156581723', to: '[ACCOUNT_ID]' }
    ]
  },
  {
    file: 'frontend/src/services/api.ts',
    patterns: [
      { from: 'https://sf4s0o6i16.execute-api.us-east-2.amazonaws.com', to: 'https://[API_GATEWAY_ID].execute-api.[REGIAO_EMPRESA].amazonaws.com' }
    ]
  },
  {
    file: 'backend/config.js',
    patterns: [
      { from: 'ga_quiz_secret_key_2024_bahia_education', to: '[JWT_SECRET_EMPRESA]' }
    ]
  }
];

// Função para fazer as substituições
function cleanFile(filePath, patterns) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  patterns.forEach(pattern => {
    if (content.includes(pattern.from)) {
      content = content.replace(new RegExp(pattern.from, 'g'), pattern.to);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Limpo: ${filePath}`);
  } else {
    console.log(`ℹ️  Nenhuma alteração necessária: ${filePath}`);
  }
}

// Executar limpeza
replacements.forEach(({ file, patterns }) => {
  cleanFile(file, patterns);
});

// Remover arquivos sensíveis
const sensitiveFiles = [
  'backend/config.env',
  'backend/config.production.env',
  'backend/serviceAccountKey.json',
  'backend/firebase-data.json'
];

sensitiveFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`🗑️  Removido arquivo sensível: ${file}`);
  }
});

// Criar arquivo .env.example
const envExample = `# Configurações para a empresa
# Copie este arquivo para .env e preencha com os valores corretos

# API
VITE_API_BASE_URL=https://[API_GATEWAY_ID].execute-api.[REGIAO_EMPRESA].amazonaws.com

# Banco de Dados (apenas para desenvolvimento local)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ga_quiz
DB_USER=postgres
DB_PASSWORD=password
DB_SSL=false

# JWT
JWT_SECRET=seu_jwt_secret_aqui
`;

fs.writeFileSync('frontend/.env.example', envExample);
console.log('✅ Criado: frontend/.env.example');

// Criar arquivo de configuração da empresa
const empresaConfig = `# Configurações da Empresa
# Preencha com os valores específicos da empresa

# AWS
REGIAO_EMPRESA=us-east-1
ACCOUNT_ID=123456789012
NOME_PROJETO=ga-quiz-empresa
PREFIXO_SSM=/ga-quiz-empresa

# Banco de Dados
DB_HOST=[ENDPOINT_RDS]
DB_PORT=5432
DB_NAME=ga_quiz
DB_USER=[USUARIO_RDS]
DB_PASSWORD=[SENHA_RDS]

# Segurança
JWT_SECRET=[JWT_SECRET_FORTE]

# URLs (serão preenchidas após o deploy)
API_GATEWAY_ID=[SERÁ_PREENCHIDO_APÓS_DEPLOY]
FRONTEND_URL=[SERÁ_PREENCHIDO_APÓS_DEPLOY]
`;

fs.writeFileSync('CONFIG-EMPRESA.env', empresaConfig);
console.log('✅ Criado: CONFIG-EMPRESA.env');

console.log('\n🎉 Limpeza concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Preencher CONFIG-EMPRESA.env com os valores da empresa');
console.log('2. Seguir o GUIA-DEPLOY-EMPRESA.md');
console.log('3. Fazer deploy na AWS da empresa');
console.log('\n⚠️  IMPORTANTE: Não commitar arquivos com credenciais!');
