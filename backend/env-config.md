# 🔧 **Variáveis de Ambiente para PostgreSQL**

## **📋 Arquivo .env Atualizado**

Substitua seu arquivo `.env` atual por este:

```bash
# 🚀 GA Quiz - Configuração PostgreSQL

# ========================================
# CONFIGURAÇÃO DO BANCO DE DADOS
# ========================================

# AWS RDS PostgreSQL
DB_HOST=quiz-db.abc123.us-east-1.rds.amazonaws.com
DB_NAME=ga_quiz_db
DB_USER=admin
DB_PASSWORD=sua_senha_super_segura
DB_PORT=5432
DB_SSL=true

# ========================================
# CONFIGURAÇÃO JWT
# ========================================
JWT_SECRET=ga_quiz_secret_key_2024_bahia_education_postgresql

# ========================================
# CONFIGURAÇÃO DO SERVIDOR
# ========================================
PORT=3001
NODE_ENV=production

# ========================================
# CONFIGURAÇÃO DE SEGURANÇA
# ========================================
# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# ========================================
# CONFIGURAÇÃO DE LOGS
# ========================================
LOG_LEVEL=info
LOG_QUERIES=true

# ========================================
# CONFIGURAÇÃO DE CAMPANHA
# ========================================
CAMPAIGN_DURATION_DAYS=10
CAMPAIGN_START_DATE=2025-01-15

# ========================================
# CONFIGURAÇÃO DE GAMIFICAÇÃO
# ========================================
XP_PER_LEVEL=100
MAX_LEVEL=10

# ========================================
# CONFIGURAÇÃO DE BACKUP
# ========================================
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=7
```

## **🔑 Variáveis Obrigatórias**

### **Para Funcionamento Básico:**
- ✅ `DB_HOST` - Endpoint do RDS
- ✅ `DB_NAME` - Nome do banco
- ✅ `DB_USER` - Usuário do banco
- ✅ `DB_PASSWORD` - Senha do banco
- ✅ `JWT_SECRET` - Chave para JWT

### **Para Produção:**
- ✅ `DB_SSL=true` - Conexão segura
- ✅ `NODE_ENV=production` - Modo produção
- ✅ `PORT` - Porta do servidor

## **⚠️ Variáveis Removidas (Firebase)**

Estas variáveis **NÃO são mais necessárias**:
- ❌ `FIREBASE_DATABASE_URL`
- ❌ `FIREBASE_SERVICE_ACCOUNT_KEY`
- ❌ `FIREBASE_PROJECT_ID`

## **📱 Como Configurar**

### **1. Copiar o arquivo .env.example**
```bash
cp .env.example .env
```

### **2. Editar as variáveis**
```bash
nano .env
# ou
code .env
```

### **3. Substituir valores**
- `DB_HOST` → Seu endpoint RDS
- `DB_USER` → Seu usuário do banco
- `DB_PASSWORD` → Sua senha do banco
- `DB_NAME` → Nome do seu banco

### **4. Verificar configuração**
```bash
# Testar conexão
node test-db-connection.js
```

## **🔒 Segurança**

### **Nunca commitar no Git:**
- ❌ `.env` (arquivo real)
- ❌ Senhas reais
- ❌ Chaves privadas

### **Sempre commitar:**
- ✅ `.env.example` (template)
- ✅ `env-config.md` (documentação)

## **🚀 Próximos Passos**

1. ✅ Configure o banco RDS na AWS
2. ✅ Crie o arquivo `.env` com suas credenciais
3. ✅ Execute o script de migração
4. ✅ Teste a conexão
5. ✅ Atualize o código para PostgreSQL


