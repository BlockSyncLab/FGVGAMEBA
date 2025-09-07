# 🚀 Guia Completo - Deploy GA Quiz na AWS da Empresa

## 📋 **Pré-requisitos**

### **1. Acesso à AWS da Empresa**
- Conta AWS com permissões administrativas
- AWS CLI instalado e configurado
- Node.js 18+ instalado
- Git instalado

### **2. Informações Necessárias**
- **Região AWS** da empresa (ex: `us-east-1`, `us-west-2`, `sa-east-1`)
- **Nome do projeto** (ex: `ga-quiz-empresa`)
- **Domínio** (se houver, ex: `quiz.empresa.com`)

---

## 🔧 **PASSO 1: Configurar AWS CLI**

### **1.1 Instalar AWS CLI**
```bash
# Windows (PowerShell)
winget install Amazon.AWSCLI

# Ou baixar MSI do site oficial
# https://aws.amazon.com/cli/
```

### **1.2 Configurar Credenciais**
```bash
aws configure
```

**Informações necessárias:**
- **AWS Access Key ID**: [Fornecido pela empresa]
- **AWS Secret Access Key**: [Fornecido pela empresa]
- **Default region name**: [Região da empresa, ex: `us-east-1`]
- **Default output format**: `json`

### **1.3 Testar Conexão**
```bash
aws sts get-caller-identity
```

---

## 🗄️ **PASSO 2: Configurar Banco de Dados RDS**

### **2.1 Criar Instância RDS PostgreSQL**
```bash
# Substituir pelos valores da empresa
aws rds create-db-instance \
  --db-instance-identifier ga-quiz-empresa-db \
  --db-instance-class db.t4g.micro \
  --engine postgres \
  --master-username [USUARIO_ADMIN] \
  --master-user-password [SENHA_FORTE] \
  --allocated-storage 20 \
  --vpc-security-group-ids [SECURITY_GROUP_ID] \
  --region [REGIAO_EMPRESA]
```

### **2.2 Configurar Security Group**
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

### **2.3 Obter Endpoint do RDS**
```bash
aws rds describe-db-instances \
  --db-instance-identifier ga-quiz-empresa-db \
  --region [REGIAO_EMPRESA] \
  --query 'DBInstances[0].Endpoint.Address'
```

---

## 🔐 **PASSO 3: Configurar SSM Parameter Store**

### **3.1 Criar Parâmetros de Configuração**
```bash
# Configurações do Banco
aws ssm put-parameter \
  --name "/ga-quiz-empresa/db-host" \
  --value "[ENDPOINT_RDS]" \
  --type "SecureString" \
  --region [REGIAO_EMPRESA]

aws ssm put-parameter \
  --name "/ga-quiz-empresa/db-port" \
  --value "5432" \
  --type "SecureString" \
  --region [REGIAO_EMPRESA]

aws ssm put-parameter \
  --name "/ga-quiz-empresa/db-name" \
  --value "ga_quiz" \
  --type "SecureString" \
  --region [REGIAO_EMPRESA]

aws ssm put-parameter \
  --name "/ga-quiz-empresa/db-user" \
  --value "[USUARIO_RDS]" \
  --type "SecureString" \
  --region [REGIAO_EMPRESA]

aws ssm put-parameter \
  --name "/ga-quiz-empresa/db-password" \
  --value "[SENHA_RDS]" \
  --type "SecureString" \
  --region [REGIAO_EMPRESA]

# JWT Secret
aws ssm put-parameter \
  --name "/ga-quiz-empresa/jwt-secret" \
  --value "[JWT_SECRET_FORTE]" \
  --type "SecureString" \
  --region [REGIAO_EMPRESA]
```

---

## ⚙️ **PASSO 4: Configurar Backend**

### **4.1 Atualizar serverless.yml**
```yaml
# backend/serverless.yml
service: ga-quiz-empresa-backend
frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  region: [REGIAO_EMPRESA]  # ← ALTERAR
  environment:
    NODE_ENV: production
    DB_HOST: ${ssm:/ga-quiz-empresa/db-host}  # ← ALTERAR
    DB_PORT: ${ssm:/ga-quiz-empresa/db-port}  # ← ALTERAR
    DB_NAME: ${ssm:/ga-quiz-empresa/db-name}  # ← ALTERAR
    DB_USER: ${ssm:/ga-quiz-empresa/db-user}  # ← ALTERAR
    DB_PASSWORD: ${ssm:/ga-quiz-empresa/db-password}  # ← ALTERAR
    JWT_SECRET: ${ssm:/ga-quiz-empresa/jwt-secret}  # ← ALTERAR
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - ssm:GetParameter
            - ssm:GetParameters
          Resource:
            - "arn:aws:ssm:[REGIAO_EMPRESA]:[ACCOUNT_ID]:parameter/ga-quiz-empresa/*"  # ← ALTERAR
        - Effect: Allow
          Action:
            - rds:*
          Resource: "*"

functions:
  api:
    handler: handler.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
    timeout: 30
    memorySize: 512

  cronCampaign:
    handler: cron-handler.handler
    events:
      - schedule: cron(0 8 * * ? *)  # 8h UTC (5h BRT)
    timeout: 60
    memorySize: 256
```

### **4.2 Atualizar config.js**
```javascript
// backend/config.js
module.exports = {
  // Configurações locais (não usar em produção)
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'ga_quiz',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  DB_SSL: process.env.NODE_ENV === 'production',
  JWT_SECRET: process.env.JWT_SECRET || 'ga_quiz_secret_key_2024_empresa'
};
```

---

## 🌐 **PASSO 5: Configurar Frontend**

### **5.1 Atualizar API Service**
```typescript
// frontend/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://[API_GATEWAY_ID].execute-api.[REGIAO_EMPRESA].amazonaws.com';
```

### **5.2 Criar arquivo .env**
```bash
# frontend/.env
VITE_API_BASE_URL=https://[API_GATEWAY_ID].execute-api.[REGIAO_EMPRESA].amazonaws.com
```

---

## 🚀 **PASSO 6: Deploy do Backend**

### **6.1 Instalar Dependências**
```bash
cd backend
npm install
```

### **6.2 Deploy com Serverless**
```bash
npm run deploy
```

### **6.3 Obter URL da API**
```bash
# Após o deploy, anotar a URL da API
# Exemplo: https://abc123.execute-api.us-east-1.amazonaws.com
```

---

## 📦 **PASSO 7: Deploy do Frontend**

### **7.1 Atualizar URL da API**
```bash
# Editar frontend/src/services/api.ts
# Substituir pela URL real da API obtida no passo 6.3
```

### **7.2 Build e Deploy**
```bash
cd frontend
npm install
npm run build

# Criar bucket S3
aws s3 mb s3://ga-quiz-empresa-frontend --region [REGIAO_EMPRESA]

# Configurar website estático
aws s3 website s3://ga-quiz-empresa-frontend \
  --index-document index.html \
  --error-document index.html

# Upload dos arquivos
aws s3 sync dist/ s3://ga-quiz-empresa-frontend --delete
```

### **7.3 Configurar Bucket Público**
```bash
# Via AWS Console (mais fácil):
# 1. Acessar S3 → ga-quiz-empresa-frontend
# 2. Permissions → Block public access → Edit → Desmarcar todas as opções
# 3. Permissions → Bucket policy → Add policy:

{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ga-quiz-empresa-frontend/*"
    }
  ]
}
```

---

## 🗃️ **PASSO 8: Configurar e Migrar Banco de Dados**

### **8.1 Criar Banco de Dados**
```bash
# Conectar ao RDS como usuário admin
psql -h [ENDPOINT_RDS] -U [USUARIO_ADMIN] -d postgres

# Criar banco de dados
CREATE DATABASE ga_quiz;

# Criar usuário específico para a aplicação
CREATE USER ga_quiz_user WITH PASSWORD '[SENHA_APP]';

# Dar permissões ao usuário
GRANT ALL PRIVILEGES ON DATABASE ga_quiz TO ga_quiz_user;

# Conectar ao banco criado
\c ga_quiz

# Dar permissões nas tabelas
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ga_quiz_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ga_quiz_user;

# Sair
\q
```

### **8.2 Executar Script de Migração Completa**
```bash
cd backend

# Executar script completo de migração (recomendado)
node migrate-database-empresa.js

# OU executar scripts individuais:
# node create-tables.js
# node create-sample-questions.js

# Verificar se as tabelas foram criadas
psql -h [ENDPOINT_RDS] -U ga_quiz_user -d ga_quiz -c "\dt"
```

### **8.3 Migrar Dados Existentes (se houver)**

#### **8.3.1 Se você tem dados em outro banco:**
```bash
# Exportar dados do banco antigo
pg_dump -h [HOST_ANTIGO] -U [USER_ANTIGO] -d [DB_ANTIGO] > backup.sql

# Importar para o novo banco
psql -h [ENDPOINT_RDS] -U ga_quiz_user -d ga_quiz < backup.sql
```

#### **8.3.2 Se você tem dados em Firebase:**
```bash
# Executar script de migração do Firebase
node migrate-firebase-to-postgres.js
```

#### **8.3.3 Se você tem dados em SQLite:**
```bash
# Executar script de migração do SQLite
node migrate-database.js
```

### **8.4 Criar Dados de Exemplo (se necessário)**
```bash
# Executar script para criar usuários de exemplo
node create-sample-questions.js

# Executar script para criar perguntas de exemplo
node create-sample-questions.js
```

### **8.5 Verificar Migração**
```bash
# Testar conexão com o banco
node test-db-connection.js

# Verificar estatísticas
psql -h [ENDPOINT_RDS] -U ga_quiz_user -d ga_quiz -c "
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN xp_atual > 0 THEN 1 END) as active_users
FROM users;
"
```

### **8.6 Atualizar Configurações SSM**
```bash
# Atualizar parâmetros SSM com as credenciais corretas
aws ssm put-parameter \
  --name "/ga-quiz-empresa/db-user" \
  --value "ga_quiz_user" \
  --type "SecureString" \
  --overwrite \
  --region [REGIAO_EMPRESA]

aws ssm put-parameter \
  --name "/ga-quiz-empresa/db-password" \
  --value "[SENHA_APP]" \
  --type "SecureString" \
  --overwrite \
  --region [REGIAO_EMPRESA]
```

---

## ✅ **PASSO 9: Testes Finais**

### **9.1 Testar API**
```bash
# Testar endpoint de teste
curl https://[API_GATEWAY_ID].execute-api.[REGIAO_EMPRESA].amazonaws.com/api/test

# Testar login
curl -X POST https://[API_GATEWAY_ID].execute-api.[REGIAO_EMPRESA].amazonaws.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"TESTE","senha":"123456"}'
```

### **9.2 Testar Frontend**
```bash
# Acessar no navegador
https://ga-quiz-empresa-frontend.s3.[REGIAO_EMPRESA].amazonaws.com/index.html
```

---

## 🔧 **PASSO 10: Configurações Opcionais**

### **10.1 CloudFront (CDN)**
```bash
# Criar distribuição CloudFront para melhor performance
# Via AWS Console: CloudFront → Create Distribution
# Origin Domain: ga-quiz-empresa-frontend.s3.[REGIAO_EMPRESA].amazonaws.com
```

### **10.2 Domínio Personalizado**
```bash
# Configurar Route 53 para domínio personalizado
# Exemplo: quiz.empresa.com
```

### **10.3 Monitoramento**
```bash
# Configurar CloudWatch para logs e métricas
# Já configurado automaticamente pelo Serverless Framework
```

---

## 📝 **Checklist Final**

- [ ] AWS CLI configurado
- [ ] RDS PostgreSQL criado
- [ ] Security Groups configurados
- [ ] SSM Parameters criados
- [ ] Backend deployado
- [ ] Frontend deployado
- [ ] Bucket S3 público
- [ ] Dados migrados
- [ ] Testes realizados
- [ ] URLs anotadas

---

## 🆘 **Troubleshooting**

### **Erro de Permissão IAM**
```bash
# Adicionar permissões ao usuário:
# - IAMFullAccess
# - CloudFormationFullAccess
# - AmazonEventBridgeFullAccess
# - CloudWatchEventsFullAccess
```

### **Erro de CORS**
```bash
# Verificar se o CORS está habilitado no API Gateway
# Configurado automaticamente pelo Serverless Framework
```

### **Erro de Conexão com RDS**
```bash
# Verificar Security Groups
# Verificar se o RDS está na mesma VPC do Lambda
```

---

## 📞 **Suporte**

Para dúvidas ou problemas:
1. Verificar logs do CloudWatch
2. Verificar configurações do SSM
3. Testar conectividade com RDS
4. Verificar permissões IAM

---

## 🎯 **URLs Finais**

Após o deploy completo, você terá:

- **API**: `https://[API_GATEWAY_ID].execute-api.[REGIAO_EMPRESA].amazonaws.com`
- **Frontend**: `https://ga-quiz-empresa-frontend.s3.[REGIAO_EMPRESA].amazonaws.com/index.html`
- **Banco**: `[ENDPOINT_RDS]:5432`

---

**🎉 Parabéns! O GA Quiz está rodando na AWS da empresa!**
