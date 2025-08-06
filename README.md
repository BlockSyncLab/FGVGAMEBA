# 🎯 GA Quiz - Sistema de Gamificação Educacional

Sistema de quiz gamificado sobre a história da Bahia, desenvolvido para estudantes do ensino fundamental.

## 🚀 Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Banco de Dados**: Firebase Realtime Database
- **Deploy**: DigitalOcean App Platform

## 📁 Estrutura do Projeto

```
├── backend/           # API Node.js
├── frontend/          # Aplicação React
├── FIREBASE-SETUP.md  # Guia Firebase
└── DEPLOY-GUIDE.md    # Guia de Deploy
```

## 🔧 Configuração Local

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Firebase

### Backend
```bash
cd backend
npm install
cp serviceAccountKey.json .  # Adicionar arquivo do Firebase
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🚀 Deploy

### 1. Configurar Firebase
Siga o guia em `FIREBASE-SETUP.md`

### 2. Subir para GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 3. Deploy no DigitalOcean App Platform
Siga o guia em `DEPLOY-GUIDE.md`

## 📊 Funcionalidades

- ✅ Sistema de login
- ✅ Quiz diário com 4 perguntas sobre Bahia
- ✅ Sistema de XP e gamificação
- ✅ Ranking de turmas
- ✅ Modal de próxima pergunta
- ✅ Dicas na mensagem de acerto

## 🔒 Segurança

- JWT para autenticação
- Rate limiting
- CORS configurado
- Logs de segurança

## 📝 Licença

MIT License

---

**Desenvolvido para a educação na Bahia** 🇧🇷 