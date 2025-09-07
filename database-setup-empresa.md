# 🗄️ Configuração Completa do Banco de Dados - Empresa

## 📋 **Visão Geral**

Este guia detalha todo o processo de configuração e migração do banco de dados PostgreSQL na AWS da empresa.

## 🏗️ **Estrutura do Banco**

### **Tabelas Principais:**

#### **1. `users` - Usuários do Sistema**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  login VARCHAR(50) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,           -- Hash bcrypt
  turma VARCHAR(100),                    -- Ex: "9º Ano A"
  escola VARCHAR(100),                   -- Ex: "Escola Municipal"
  xp_atual INTEGER DEFAULT 0,           -- Pontos de experiência
  erros INTEGER DEFAULT 0,              -- Número de erros
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Respostas individuais (para performance)
  id_q1 INTEGER, response_q1 BOOLEAN,
  id_q2 INTEGER, response_q2 BOOLEAN,
  id_q3 INTEGER, response_q3 BOOLEAN,
  id_q4 INTEGER, response_q4 BOOLEAN,
  id_q5 INTEGER, response_q5 BOOLEAN,
  id_q6 INTEGER, response_q6 BOOLEAN,
  id_q7 INTEGER, response_q7 BOOLEAN,
  id_q8 INTEGER, response_q8 BOOLEAN,
  id_q9 INTEGER, response_q9 BOOLEAN,
  id_q10 INTEGER, response_q10 BOOLEAN
);
```

#### **2. `questions` - Perguntas do Quiz**
```sql
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  day INTEGER NOT NULL,                  -- Dia da campanha (1-10)
  pergunta TEXT NOT NULL,                -- Texto da pergunta
  imagem VARCHAR(255),                   -- URL da imagem (opcional)
  dica TEXT,                            -- Dica para a pergunta
  a1 VARCHAR(255) NOT NULL,             -- Alternativa 1
  a2 VARCHAR(255) NOT NULL,             -- Alternativa 2
  a3 VARCHAR(255) NOT NULL,             -- Alternativa 3
  a4 VARCHAR(255) NOT NULL,             -- Alternativa 4
  a5 VARCHAR(255) NOT NULL,             -- Alternativa 5
  resposta_correta INTEGER NOT NULL,    -- 1-5
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **3. `campaigns` - Campanhas Ativas**
```sql
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,           -- Nome da campanha
  data_inicio DATE NOT NULL,            -- Data de início
  data_fim DATE,                        -- Data de fim (opcional)
  duracao_dias INTEGER DEFAULT 10,      -- Duração em dias
  ativa BOOLEAN DEFAULT true,           -- Se está ativa
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **4. `user_responses` - Histórico de Respostas**
```sql
CREATE TABLE user_responses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  question_id INTEGER REFERENCES questions(id),
  resposta INTEGER NOT NULL,            -- Resposta escolhida (1-5)
  correta BOOLEAN NOT NULL,             -- Se estava correta
  xp_ganho INTEGER DEFAULT 0,          -- XP ganho nesta resposta
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 **Configuração do RDS**

### **1. Criar Instância RDS**
```bash
aws rds create-db-instance \
  --db-instance-identifier ga-quiz-empresa-db \
  --db-instance-class db.t4g.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password [SENHA_FORTE] \
  --allocated-storage 20 \
  --storage-type gp2 \
  --vpc-security-group-ids [SECURITY_GROUP_ID] \
  --backup-retention-period 7 \
  --multi-az false \
  --publicly-accessible false \
  --region [REGIAO_EMPRESA]
```

### **2. Configurar Security Group**
```bash
# Criar Security Group
aws ec2 create-security-group \
  --group-name ga-quiz-empresa-rds-sg \
  --description "Security Group para RDS GA Quiz" \
  --region [REGIAO_EMPRESA]

# Adicionar regra para PostgreSQL
aws ec2 authorize-security-group-ingress \
  --group-id [SECURITY_GROUP_ID] \
  --protocol tcp \
  --port 5432 \
  --cidr 0.0.0.0/0 \
  --region [REGIAO_EMPRESA]
```

## 🚀 **Processo de Migração**

### **Passo 1: Preparar Ambiente**
```bash
# Instalar PostgreSQL client
# Windows: https://www.postgresql.org/download/windows/
# Linux: sudo apt-get install postgresql-client
# macOS: brew install postgresql

# Verificar instalação
psql --version
```

### **Passo 2: Conectar ao RDS**
```bash
# Conectar como usuário admin
psql -h [ENDPOINT_RDS] -U postgres -d postgres

# Exemplo:
# psql -h ga-quiz-empresa-db.abc123.us-east-1.rds.amazonaws.com -U postgres -d postgres
```

### **Passo 3: Criar Banco e Usuário**
```sql
-- Criar banco de dados
CREATE DATABASE ga_quiz;

-- Criar usuário específico
CREATE USER ga_quiz_user WITH PASSWORD 'senha_forte_aqui';

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE ga_quiz TO ga_quiz_user;

-- Conectar ao banco criado
\c ga_quiz

-- Dar permissões nas tabelas
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ga_quiz_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ga_quiz_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ga_quiz_user;

-- Sair
\q
```

### **Passo 4: Executar Migração**
```bash
cd backend

# Configurar variáveis de ambiente
export DB_HOST=[ENDPOINT_RDS]
export DB_PORT=5432
export DB_NAME=ga_quiz
export DB_USER=ga_quiz_user
export DB_PASSWORD=[SENHA_APP]

# Executar script de migração
node migrate-database-empresa.js
```

## 📊 **Dados de Exemplo**

### **Usuário de Teste:**
- **Login**: `TESTE`
- **Senha**: `123456`
- **Turma**: `9º Ano A`
- **Escola**: `Escola Teste`
- **XP**: `100`

### **Perguntas de Exemplo:**
1. **Dia 1**: Qual é a capital do Brasil?
2. **Dia 2**: Quantos estados tem o Brasil?
3. **Dia 3**: Qual é o maior oceano do mundo?

### **Campanha Ativa:**
- **Nome**: `Campanha Teste`
- **Duração**: `10 dias`
- **Status**: `Ativa`

## 🔍 **Verificação da Migração**

### **1. Verificar Tabelas**
```sql
-- Conectar ao banco
psql -h [ENDPOINT_RDS] -U ga_quiz_user -d ga_quiz

-- Listar tabelas
\dt

-- Verificar estrutura de uma tabela
\d users
```

### **2. Verificar Dados**
```sql
-- Contar registros
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM questions;
SELECT COUNT(*) FROM campaigns;

-- Ver usuário de teste
SELECT * FROM users WHERE login = 'TESTE';

-- Ver perguntas
SELECT id, day, pergunta FROM questions ORDER BY day;
```

### **3. Testar Conexão via Script**
```bash
cd backend
node test-db-connection.js
```

## 🔐 **Configurações de Segurança**

### **1. Usuário com Permissões Mínimas**
```sql
-- Criar usuário apenas para leitura (opcional)
CREATE USER ga_quiz_readonly WITH PASSWORD 'senha_readonly';
GRANT CONNECT ON DATABASE ga_quiz TO ga_quiz_readonly;
GRANT USAGE ON SCHEMA public TO ga_quiz_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ga_quiz_readonly;
```

### **2. Configurar SSL**
```javascript
// No config.js
const config = {
  // ... outras configurações
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync('path/to/ca-cert.pem').toString()
  }
};
```

## 📈 **Monitoramento e Manutenção**

### **1. Backup Automático**
```bash
# O RDS já faz backup automático
# Configurar período de retenção: 7 dias (padrão)
```

### **2. Monitoramento de Performance**
```sql
-- Verificar queries lentas
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Verificar tamanho das tabelas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### **3. Limpeza de Dados Antigos**
```sql
-- Limpar respostas antigas (opcional)
DELETE FROM user_responses 
WHERE created_at < NOW() - INTERVAL '1 year';

-- Limpar usuários inativos (opcional)
DELETE FROM users 
WHERE xp_atual = 0 
AND created_at < NOW() - INTERVAL '6 months';
```

## 🆘 **Troubleshooting**

### **Problema: Erro de Conexão**
```bash
# Verificar se o RDS está rodando
aws rds describe-db-instances --db-instance-identifier ga-quiz-empresa-db

# Verificar Security Groups
aws ec2 describe-security-groups --group-ids [SG_ID]

# Testar conectividade
telnet [ENDPOINT_RDS] 5432
```

### **Problema: Erro de Permissão**
```sql
-- Verificar permissões do usuário
SELECT * FROM information_schema.role_table_grants 
WHERE grantee = 'ga_quiz_user';

-- Dar permissões adicionais se necessário
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ga_quiz_user;
```

### **Problema: Tabelas Não Criadas**
```bash
# Verificar logs do script
node migrate-database-empresa.js

# Executar manualmente
psql -h [ENDPOINT_RDS] -U ga_quiz_user -d ga_quiz -f create-tables.sql
```

## 📋 **Checklist de Migração**

- [ ] RDS PostgreSQL criado
- [ ] Security Group configurado
- [ ] Banco `ga_quiz` criado
- [ ] Usuário `ga_quiz_user` criado
- [ ] Permissões configuradas
- [ ] Script de migração executado
- [ ] Tabelas criadas
- [ ] Dados de exemplo inseridos
- [ ] Usuário de teste funcionando
- [ ] Conexão via aplicação testada
- [ ] Backup automático configurado
- [ ] Monitoramento configurado

---

## 🎯 **Resultado Final**

Após a migração completa, você terá:

- ✅ **Banco PostgreSQL** rodando no RDS
- ✅ **4 tabelas principais** criadas
- ✅ **Usuário de teste** funcionando
- ✅ **Perguntas de exemplo** carregadas
- ✅ **Campanha ativa** configurada
- ✅ **Conexão segura** via SSL
- ✅ **Backup automático** configurado

**O banco estará pronto para receber usuários reais e dados de produção!** 🚀
