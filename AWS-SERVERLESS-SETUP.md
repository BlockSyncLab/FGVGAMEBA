# 🚀 Guia de Migração para AWS Serverless

## 📋 Visão Geral

Este guia explica como migrar seu projeto GA Quiz para uma arquitetura serverless na AWS, aproveitando:
- **AWS Lambda** para o backend
- **API Gateway** para roteamento
- **S3 + CloudFront** para o frontend
- **RDS PostgreSQL** para o banco de dados
- **SSM Parameter Store** para configurações

## 🏗️ Arquitetura Proposta

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   CloudFront     │    │   S3 Bucket     │
│   (React)       │───▶│   (CDN)          │───▶│   (Static Files)│
└─────────────────┘    └──────────────────┘    └─────────────────┘

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Gateway   │    │   Lambda         │    │   RDS           │
│   (Routing)     │───▶│   (Functions)    │───▶│   PostgreSQL    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔧 Pré-requisitos

1. **AWS CLI** configurado
2. **Node.js 18+** instalado
3. **Serverless Framework** instalado globalmente
4. **Conta AWS** com permissões adequadas

## 📦 Instalação das Dependências

### Backend
```bash
cd backend
npm install -g serverless
npm install --save-dev serverless serverless-offline
npm install serverless-http
```

### Frontend
```bash
cd frontend
npm install -g serverless
```

## 🔐 Configuração da AWS

### 1. Configurar AWS CLI
```bash
aws configure
# AWS Access Key ID: [sua-access-key]
# AWS Secret Access Key: [sua-secret-key]
# Default region name: us-east-1
# Default output format: json
```

### 2. Criar Parâmetros no SSM Parameter Store
```bash
# Configurações do banco de dados
aws ssm put-parameter --name "/ga-quiz/db-host" --value "seu-rds-endpoint" --type "String"
aws ssm put-parameter --name "/ga-quiz/db-port" --value "5432" --type "String"
aws ssm put-parameter --name "/ga-quiz/db-name" --value "ga_quiz_db" --type "String"
aws ssm put-parameter --name "/ga-quiz/db-user" --value "seu_usuario" --type "String"
aws ssm put-parameter --name "/ga-quiz/db-password" --value "sua_senha" --type "SecureString"

# Configurações JWT e Firebase
aws ssm put-parameter --name "/ga-quiz/jwt-secret" --value "sua_chave_jwt" --type "SecureString"
aws ssm put-parameter --name "/ga-quiz/firebase-project-id" --value "seu-projeto-id" --type "String"
aws ssm put-parameter --name "/ga-quiz/firebase-private-key" --value "sua-chave-privada" --type "SecureString"
aws ssm put-parameter --name "/ga-quiz/firebase-client-email" --value "seu-email-cliente" --type "String"
```

## 🚀 Deploy do Backend

### 1. Testar Localmente
```bash
cd backend
npm run offline
```

### 2. Deploy para AWS
```bash
# Deploy para desenvolvimento
npm run deploy

# Deploy para produção
npm run deploy:prod
```

### 3. Verificar Logs
```bash
# Logs da API
npm run logs

# Logs do cron job
npm run logs:cron
```

## 🌐 Deploy do Frontend

### 1. Build e Deploy
```bash
cd frontend
npm run build:deploy
```

### 2. Configurar Domínio Personalizado (Opcional)
```bash
# Após o deploy, configure seu domínio no CloudFront
# ou use o domínio gerado automaticamente
```

## 🔄 Migração Gradual

### Fase 1: Backend Serverless
1. ✅ Deploy das funções Lambda
2. ✅ Teste das APIs
3. ✅ Migração do tráfego gradualmente

### Fase 2: Frontend Serverless
1. ✅ Deploy no S3 + CloudFront
2. ✅ Configuração de CORS
3. ✅ Teste de funcionalidade

### Fase 3: Otimizações
1. ✅ Configuração de cache
2. ✅ Monitoramento e alertas
3. ✅ Otimização de custos

## 💰 Estimativa de Custos

### Backend (Lambda + API Gateway)
- **Lambda**: ~$0.20 por 1M de requisições
- **API Gateway**: ~$3.50 por 1M de requisições
- **Cron Jobs**: ~$0.50 por mês

### Frontend (S3 + CloudFront)
- **S3**: ~$0.023 por GB/mês
- **CloudFront**: ~$0.085 por GB transferido

### Banco de Dados (RDS)
- **PostgreSQL**: ~$15-50 por mês (dependendo do tamanho)

## 🚨 Considerações Importantes

### 1. Cold Start
- Primeira requisição pode ser mais lenta
- Use **Provisioned Concurrency** para APIs críticas

### 2. Timeout
- Lambda tem limite de 15 minutos
- Para processos longos, use **Step Functions**

### 3. Memória
- Configure memória adequada para suas funções
- Mais memória = mais CPU = mais rápido

### 4. Conexões de Banco
- Use **Connection Pooling** para RDS
- Considere **RDS Proxy** para alta concorrência

## 🔍 Monitoramento

### CloudWatch
- Logs automáticos das funções Lambda
- Métricas de performance
- Alertas configuráveis

### X-Ray
- Rastreamento de requisições
- Análise de performance
- Debugging distribuído

## 🛠️ Comandos Úteis

```bash
# Ver status do deploy
serverless info

# Remover stack
serverless remove

# Ver logs em tempo real
serverless logs -f api -t

# Invocar função manualmente
serverless invoke -f api -d '{"httpMethod": "GET", "path": "/api/test"}'
```

## 📚 Recursos Adicionais

- [Serverless Framework Docs](https://www.serverless.com/framework/docs/)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [API Gateway Tutorial](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)

## 🆘 Suporte

Em caso de problemas:
1. Verifique os logs no CloudWatch
2. Teste localmente com `serverless offline`
3. Verifique as permissões IAM
4. Consulte a documentação oficial

---

**🎯 Resultado Esperado**: Sistema totalmente serverless, escalável e com custos otimizados!



