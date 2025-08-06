# 📤 Subindo o Código para o GitHub

## 🔧 Passo 1: Preparar o Repositório

### 1.1 Inicializar Git (se ainda não foi feito)
```bash
git init
git add .
git commit -m "Initial commit - GA Quiz com Firebase"
```

### 1.2 Conectar com o Repositório Remoto
```bash
# Para o repositório principal (se você criou um só)
git remote add origin https://github.com/SEU_USUARIO/ga-quiz.git

# OU se você criou dois repositórios separados:
# git remote add origin https://github.com/SEU_USUARIO/ga-quiz-backend.git
# git remote add origin https://github.com/SEU_USUARIO/ga-quiz-frontend.git
```

### 1.3 Fazer Push
```bash
git branch -M main
git push -u origin main
```

---

## 📁 Estrutura que será enviada:

```
ga-quiz/
├── backend/
│   ├── routes/
│   ├── database/
│   ├── serviceAccountKey.json
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── README.md
├── DEPLOY-GUIDE.md
└── ...
```

---

## ⚠️ Importante - Arquivos Sensíveis

### ✅ Arquivos que DEVEM ser enviados:
- `backend/serviceAccountKey.json` (necessário para o deploy)
- Todos os arquivos de código
- Arquivos de configuração

### ❌ Arquivos que NÃO devem ser enviados (já estão no .gitignore):
- `node_modules/`
- `.env` (se existir)
- Logs e arquivos temporários

---

## 🔄 Se você criou dois repositórios separados:

### Opção 1: Repositório Único (Recomendado)
- Envie tudo para um repositório só
- O DigitalOcean vai usar as pastas `backend/` e `frontend/`

### Opção 2: Repositórios Separados
Se você criou dois repositórios, você precisará:

1. **Para o Backend:**
```bash
# Em uma pasta separada
git clone https://github.com/SEU_USUARIO/ga-quiz-backend.git
# Copiar apenas a pasta backend/
git add .
git commit -m "Backend GA Quiz"
git push
```

2. **Para o Frontend:**
```bash
# Em uma pasta separada
git clone https://github.com/SEU_USUARIO/ga-quiz-frontend.git
# Copiar apenas a pasta frontend/
git add .
git commit -m "Frontend GA Quiz"
git push
```

---

## 🎯 Próximos Passos

1. **Escolha sua opção** (repositório único ou separados)
2. **Execute os comandos** acima
3. **Verifique** se o código está no GitHub
4. **Continue** com o deploy no DigitalOcean

**Qual opção você prefere? Repositório único ou separados?** 