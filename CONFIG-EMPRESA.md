# 🔧 Configurações Específicas para a Empresa

## 📋 **Informações que Precisam ser Fornecidas pela Empresa**

### **1. AWS Account**
- [ ] **Região AWS**: (ex: `us-east-1`, `us-west-2`, `sa-east-1`)
- [ ] **Account ID**: (ex: `123456789012`)
- [ ] **Access Key ID**: (fornecido pela empresa)
- [ ] **Secret Access Key**: (fornecido pela empresa)

### **2. Nomenclatura do Projeto**
- [ ] **Nome do projeto**: (ex: `ga-quiz-empresa`, `quiz-fgv`)
- [ ] **Prefixo SSM**: (ex: `/ga-quiz-empresa/`)

### **3. Banco de Dados**
- [ ] **Usuário admin**: (ex: `admin`, `postgres`)
- [ ] **Senha forte**: (gerar senha segura)
- [ ] **Nome do banco**: (ex: `ga_quiz`, `quiz_empresa`)

### **4. Segurança**
- [ ] **JWT Secret**: (gerar chave secreta forte)
- [ ] **Domínio**: (se houver, ex: `quiz.empresa.com`)

---

## 🔄 **Arquivos que Precisam ser Modificados**

### **1. Backend - serverless.yml**
```yaml
# ALTERAR ESTAS LINHAS:
service: [NOME_PROJETO]-backend
region: [REGIAO_EMPRESA]
DB_HOST: ${ssm:/[PREFIXO_SSM]/db-host}
# ... (todas as referências SSM)
```

### **2. Frontend - src/services/api.ts**
```typescript
// ALTERAR ESTA LINHA:
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://[API_GATEWAY_ID].execute-api.[REGIAO_EMPRESA].amazonaws.com';
```

### **3. Frontend - .env**
```bash
# CRIAR ESTE ARQUIVO:
VITE_API_BASE_URL=https://[API_GATEWAY_ID].execute-api.[REGIAO_EMPRESA].amazonaws.com
```

---

## 🚀 **Script de Deploy Automatizado**

### **deploy-empresa.sh**
```bash
#!/bin/bash

# Configurações da empresa
REGIAO="[REGIAO_EMPRESA]"
PROJETO="[NOME_PROJETO]"
PREFIXO_SSM="/[PREFIXO_SSM]"

echo "🚀 Iniciando deploy do GA Quiz na AWS da empresa..."

# 1. Deploy do Backend
echo "📦 Deploy do Backend..."
cd backend
npm install
npm run deploy

# 2. Obter URL da API
API_URL=$(aws cloudformation describe-stacks \
  --stack-name $PROJETO-backend-dev \
  --region $REGIAO \
  --query 'Stacks[0].Outputs[?OutputKey==`ServiceEndpoint`].OutputValue' \
  --output text)

echo "✅ API URL: $API_URL"

# 3. Atualizar Frontend
echo "🌐 Configurando Frontend..."
cd ../frontend

# Criar .env
echo "VITE_API_BASE_URL=$API_URL" > .env

# Build e Deploy
npm install
npm run build

# Criar bucket S3
aws s3 mb s3://$PROJETO-frontend --region $REGIAO

# Configurar website
aws s3 website s3://$PROJETO-frontend \
  --index-document index.html \
  --error-document index.html

# Upload
aws s3 sync dist/ s3://$PROJETO-frontend --delete

echo "🎉 Deploy concluído!"
echo "Frontend: https://$PROJETO-frontend.s3.$REGIAO.amazonaws.com/index.html"
echo "API: $API_URL"
```

---

## 📝 **Checklist de Modificações**

### **Antes do Deploy:**
- [ ] Substituir `[REGIAO_EMPRESA]` em todos os arquivos
- [ ] Substituir `[NOME_PROJETO]` em todos os arquivos
- [ ] Substituir `[PREFIXO_SSM]` em todos os arquivos
- [ ] Configurar credenciais AWS
- [ ] Criar parâmetros SSM
- [ ] Criar RDS PostgreSQL

### **Após o Deploy:**
- [ ] Testar API endpoints
- [ ] Testar login no frontend
- [ ] Verificar logs do CloudWatch
- [ ] Configurar bucket S3 como público
- [ ] Migrar dados do banco

---

## 🔐 **Segurança**

### **Credenciais Sensíveis:**
- ✅ **SSM Parameter Store** (recomendado)
- ❌ **Arquivos .env** (não commitar)
- ❌ **Hardcoded** (nunca fazer)

### **Permissões IAM Mínimas:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:*",
        "apigateway:*",
        "s3:*",
        "rds:*",
        "ssm:*",
        "cloudformation:*",
        "iam:*",
        "events:*"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 📊 **Monitoramento**

### **CloudWatch Logs:**
- `/aws/lambda/[NOME_PROJETO]-backend-dev-api`
- `/aws/lambda/[NOME_PROJETO]-backend-dev-cronCampaign`

### **Métricas Importantes:**
- Invocações Lambda
- Duração das funções
- Erros 4xx/5xx
- Uso de memória

---

## 🆘 **Problemas Comuns**

### **1. Erro de Permissão IAM**
```bash
# Solução: Adicionar permissões ao usuário
aws iam attach-user-policy \
  --user-name [USUARIO] \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

### **2. Erro de CORS**
```bash
# Verificar se o CORS está habilitado no API Gateway
# Configurado automaticamente pelo Serverless Framework
```

### **3. Erro de Conexão com RDS**
```bash
# Verificar Security Groups
aws ec2 describe-security-groups --group-ids [SG_ID]
```

### **4. Erro de SSM Parameters**
```bash
# Verificar se os parâmetros existem
aws ssm get-parameters --names "/[PREFIXO_SSM]/db-host"
```

---

## 📞 **Contato para Suporte**

Em caso de dúvidas:
1. Verificar logs do CloudWatch
2. Testar conectividade com RDS
3. Verificar configurações do SSM
4. Consultar documentação AWS

---

**🎯 Com essas configurações, o deploy na AWS da empresa será bem-sucedido!**
