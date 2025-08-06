# 🔒 Segurança do Repositório

Este repositório é **público** e foi configurado para proteger informações sensíveis.

## 🛡️ Arquivos Protegidos

### **Configurações Sensíveis**
- `.env` - Variáveis de ambiente
- `config.env` - Configurações de produção
- `serviceAccountKey.json` - Chaves do Firebase
- `*.pem`, `*.key`, `*.crt` - Certificados e chaves

### **Scripts de Administração**
Os seguintes arquivos foram excluídos por conterem informações sensíveis:
- `debug-*.js` - Scripts de debug
- `fix-*.js` - Scripts de correção
- `force-*.js` - Scripts forçados
- `check-*.js` - Scripts de verificação
- `update-*.js` - Scripts de atualização
- `set-*.js` - Scripts de configuração
- `migrate-*.js` - Scripts de migração
- `auto-*.js` - Scripts automáticos
- `init-*.js` - Scripts de inicialização

### **Guias e Documentação Sensível**
- `SCRIPTS-GUIDE.md`
- `AUTO-ADVANCE-GUIDE.md`
- `CAMPAIGN-MANAGEMENT-GUIDE.md`
- `DEPLOY-GUIDE.md`
- `FIREBASE-SETUP.md`
- `AUTH-SETUP.md`
- `VARIABLES-PROD.md`

### **Arquivos de Deploy**
- `netlify.toml`
- `vercel.json`
- `deploy-*.sh`
- `commit-and-push.sh`

## ⚠️ Importante

**NUNCA** commite os seguintes arquivos:
- Arquivos `.env` com credenciais
- Chaves de API do Firebase
- Certificados SSL
- Dados de usuários
- Configurações de produção

## 🔧 Configuração Local

Para configurar o projeto localmente:

1. Copie `.env.example` para `.env`
2. Configure as variáveis de ambiente
3. Adicione as chaves do Firebase
4. Configure o banco de dados

## 📞 Suporte

Para dúvidas sobre configuração, entre em contato com a equipe de desenvolvimento. 