# 🎯 GA Quiz - Sistema de Gamificação Educacional

Sistema de quiz gamificado sobre a história da Bahia, desenvolvido para estudantes do ensino fundamental.

## 🚀 Arquitetura Atual

- **Frontend**: React + TypeScript + Vite (hospedado no S3 + CloudFront)
- **Backend**: Node.js + Express (AWS Lambda + API Gateway)
- **Banco de Dados**: PostgreSQL (AWS RDS)
- **Configurações**: AWS SSM Parameter Store
- **Deploy**: AWS Serverless (Lambda + S3)

## 📁 Estrutura do Projeto

```
├── backend/                    # API Node.js (Lambda)
├── frontend/                   # Aplicação React (S3)
├── GUIA-DEPLOY-EMPRESA.md     # Guia completo para empresa
├── CONFIG-EMPRESA.md          # Configurações específicas
├── database-setup-empresa.md  # Setup do banco de dados
├── README-EMPRESA.md          # Visão geral para empresa
└── migrate-database-empresa.js # Script de migração do banco
```

## 🔧 Configuração Local

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- AWS CLI configurado
- PostgreSQL client

### Backend (Desenvolvimento)
```bash
cd backend
npm install
npm run dev
```

### Frontend (Desenvolvimento)
```bash
cd frontend
npm install
npm run dev
```

## 🚀 Deploy na AWS

### Para Desenvolvimento Pessoal
Siga o guia em `AWS-SERVERLESS-SETUP.md`

### Para Deploy na Empresa
Siga o guia em `GUIA-DEPLOY-EMPRESA.md`

## 📊 Funcionalidades

- ✅ Sistema de login com JWT
- ✅ Quiz diário com 10 perguntas sobre Bahia
- ✅ Sistema de XP e gamificação
- ✅ Ranking de turmas em tempo real
- ✅ Modal de próxima pergunta
- ✅ Dicas na mensagem de acerto
- ✅ Dashboard do usuário
- ✅ Estatísticas detalhadas

## 🏗️ Arquitetura Serverless

### **Backend (AWS Lambda)**
- **API Gateway** para roteamento
- **Lambda Functions** para lógica de negócio
- **RDS PostgreSQL** para persistência
- **SSM Parameter Store** para configurações

### **Frontend (S3 + CloudFront)**
- **S3** para hospedagem estática
- **CloudFront** para CDN global
- **React + TypeScript** para interface

### **Banco de Dados**
- **PostgreSQL** no RDS
- **Migração automatizada** via scripts
- **Backup automático** configurado

## 🔒 Segurança

- JWT para autenticação
- Rate limiting por IP
- CORS configurado
- SSL/TLS em todas as conexões
- Logs de segurança
- Permissões IAM mínimas

## 💰 Custos Estimados

- **RDS PostgreSQL**: ~$15-20/mês
- **Lambda**: ~$1-5/mês
- **API Gateway**: ~$1-3/mês
- **S3 + CloudFront**: ~$1-5/mês
- **Total**: ~$20-35/mês

## 📚 Documentação

- **`GUIA-DEPLOY-EMPRESA.md`** - Deploy completo na empresa
- **`CONFIG-EMPRESA.md`** - Configurações específicas
- **`database-setup-empresa.md`** - Setup do banco
- **`README-EMPRESA.md`** - Visão geral para empresa

## 🚀 Deploy Rápido

```bash
# 1. Clonar repositório
git clone https://github.com/BlockSyncLab/FGVGAMEBA.git
cd FGVGAMEBA

# 2. Seguir guia da empresa
# Abrir: GUIA-DEPLOY-EMPRESA.md
```

## 📝 Licença

MIT License

---

**Desenvolvido para a educação na Bahia** 🇧🇷 