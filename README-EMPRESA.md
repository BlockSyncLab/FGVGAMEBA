# 🎯 GA Quiz - Deploy na AWS da Empresa

## 📋 **Visão Geral**

Este projeto é uma aplicação de quiz educacional que foi migrada para AWS Serverless. A aplicação inclui:

- **Backend**: AWS Lambda + API Gateway
- **Frontend**: S3 + CloudFront
- **Banco de Dados**: RDS PostgreSQL
- **Configurações**: SSM Parameter Store
- **Cron Jobs**: Lambda + EventBridge

## 🚀 **Deploy Rápido**

### **1. Pré-requisitos**
- AWS CLI configurado
- Node.js 18+
- Credenciais AWS da empresa

### **2. Configuração**
```bash
# 1. Preencher configurações da empresa
cp CONFIG-EMPRESA.env .env
# Editar .env com os valores da empresa

# 2. Executar script de limpeza
node limpar-configuracoes-pessoais.js

# 3. Seguir o guia de deploy
# Ver: GUIA-DEPLOY-EMPRESA.md
```

### **3. Deploy**
```bash
# Backend
cd backend
npm install
npm run deploy

# Frontend
cd frontend
npm install
npm run build
aws s3 sync dist/ s3://[BUCKET_NAME] --delete
```

## 📁 **Estrutura do Projeto**

```
FGV/
├── backend/                 # Backend serverless
│   ├── serverless.yml      # Configuração Serverless Framework
│   ├── handler.js          # Handler principal do Lambda
│   ├── routes/             # Rotas da API
│   └── config.js           # Configurações
├── frontend/               # Frontend React
│   ├── src/
│   │   └── services/
│   │       └── api.ts      # Cliente da API
│   └── dist/               # Build de produção
├── GUIA-DEPLOY-EMPRESA.md  # Guia completo de deploy
├── CONFIG-EMPRESA.md       # Configurações específicas
└── README-EMPRESA.md       # Este arquivo
```

## 🔧 **Configurações Necessárias**

### **AWS**
- [ ] Região AWS da empresa
- [ ] Account ID
- [ ] Credenciais de acesso

### **Banco de Dados**
- [ ] Endpoint do RDS
- [ ] Usuário e senha
- [ ] Nome do banco

### **Segurança**
- [ ] JWT Secret
- [ ] Security Groups
- [ ] Permissões IAM

## 📊 **Funcionalidades**

### **Backend (API)**
- ✅ Autenticação JWT
- ✅ Gerenciamento de usuários
- ✅ Sistema de perguntas
- ✅ Ranking e pontuação
- ✅ Cron jobs automáticos
- ✅ Rate limiting
- ✅ CORS configurado

### **Frontend**
- ✅ Interface responsiva
- ✅ Login/logout
- ✅ Dashboard do usuário
- ✅ Sistema de quiz
- ✅ Ranking em tempo real
- ✅ Estatísticas

## 🗄️ **Banco de Dados**

### **Estrutura Completa**
- **`users`** - Usuários do sistema (login, senha, turma, escola, XP)
- **`questions`** - Perguntas do quiz (10 perguntas por campanha)
- **`campaigns`** - Campanhas ativas (duração, status)
- **`user_responses`** - Histórico de respostas (para analytics)

### **Configuração**
- **RDS PostgreSQL** na AWS
- **Usuário específico** para a aplicação
- **Permissões mínimas** necessárias
- **Backup automático** configurado

### **Dados de Exemplo**
- **Usuário de teste**: `TESTE` / `123456`
- **3 perguntas** de exemplo
- **1 campanha ativa** de 10 dias
- **Sistema de XP** e níveis funcionando

### **Migração**
- **Script automatizado**: `migrate-database-empresa.js`
- **Criação completa** de estrutura e dados
- **Verificação automática** da migração
- **Documentação detalhada**: `database-setup-empresa.md`

## 🔐 **Segurança**

### **Implementado**
- ✅ Autenticação JWT
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Headers de segurança
- ✅ Validação de entrada
- ✅ Senhas criptografadas

### **Configurações AWS**
- ✅ SSM Parameter Store
- ✅ Security Groups
- ✅ IAM Roles
- ✅ VPC (se necessário)

## 📈 **Monitoramento**

### **CloudWatch**
- Logs do Lambda
- Métricas de performance
- Alertas configurados

### **Métricas Importantes**
- Invocações por minuto
- Duração das funções
- Taxa de erro
- Uso de memória

## 🚀 **Escalabilidade**

### **Backend**
- Lambda escala automaticamente
- API Gateway com throttling
- RDS com auto-scaling

### **Frontend**
- S3 com CloudFront
- CDN global
- Cache configurado

## 💰 **Custos Estimados**

### **Mensal (aproximado)**
- Lambda: $5-20
- API Gateway: $3-10
- RDS: $15-30
- S3: $1-5
- CloudWatch: $2-5

**Total: ~$25-70/mês**

## 🆘 **Troubleshooting**

### **Problemas Comuns**

#### **1. Erro 404 no Frontend**
```bash
# Verificar se as rotas estão com /api/
# Ver: frontend/src/services/api.ts
```

#### **2. Erro de Conexão com RDS**
```bash
# Verificar Security Groups
aws ec2 describe-security-groups --group-ids [SG_ID]
```

#### **3. Erro de Permissão IAM**
```bash
# Adicionar permissões necessárias
# Ver: GUIA-DEPLOY-EMPRESA.md
```

### **Logs Importantes**
```bash
# Logs do Lambda
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/"

# Logs do API Gateway
aws logs describe-log-groups --log-group-name-prefix "/aws/apigateway/"
```

## 📞 **Suporte**

### **Documentação**
- [GUIA-DEPLOY-EMPRESA.md](GUIA-DEPLOY-EMPRESA.md) - Deploy completo
- [CONFIG-EMPRESA.md](CONFIG-EMPRESA.md) - Configurações específicas
- [AWS-SERVERLESS-SETUP.md](AWS-SERVERLESS-SETUP.md) - Setup original

### **Comandos Úteis**
```bash
# Ver status do deploy
serverless info

# Ver logs em tempo real
serverless logs -f api -t

# Remover stack
serverless remove

# Testar localmente
serverless offline
```

## 🎯 **Próximos Passos**

### **Após Deploy**
1. [ ] Testar todas as funcionalidades
2. [ ] Configurar domínio personalizado
3. [ ] Configurar CloudFront
4. [ ] Configurar monitoramento
5. [ ] Documentar credenciais

### **Melhorias Futuras**
- [ ] CI/CD com GitHub Actions
- [ ] Testes automatizados
- [ ] Backup automático
- [ ] Multi-região
- [ ] Cache Redis

---

## ✅ **Checklist de Deploy**

- [ ] AWS CLI configurado
- [ ] Credenciais da empresa
- [ ] RDS PostgreSQL criado
- [ ] SSM Parameters configurados
- [ ] Backend deployado
- [ ] Frontend deployado
- [ ] Testes realizados
- [ ] URLs anotadas
- [ ] Documentação atualizada

---

**🎉 Com este guia, o GA Quiz estará rodando na AWS da empresa em poucas horas!**
