# GA Quiz Backend

Backend para o sistema GA Quiz - Sistema de Gamificação Educacional da Bahia.

## 🚀 Funcionalidades

- **Autenticação**: Login com JWT
- **Perguntas**: Sistema de perguntas diárias com liberação progressiva
- **Ranking**: Sistema de ranking por turmas
- **Gamificação**: Sistema de XP e níveis
- **Turmas**: Gestão de dados por turma

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- MySQL (versão 5.7 ou superior)
- npm ou yarn

## 🛠️ Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar banco de dados:**
```bash
# Inicializar banco de dados (cria tabelas e dados de exemplo)
npm run init-db
```

3. **Iniciar servidor:**
```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

## 🗄️ Estrutura do Banco de Dados

### Tabela `users`
- `id`: ID único do usuário
- `login`: Login do usuário
- `senha`: Senha criptografada
- `turma`: Turma do usuário
- `escola`: Escola do usuário
- `xp_atual`: XP atual do usuário
- `erros`: Número de erros
- `id_q1` a `id_q5`: IDs das perguntas (1-5)
- `response_q1` a `response_q5`: Se já respondeu (boolean)

### Tabela `perguntas`
- `id`: ID único da pergunta
- `pergunta`: Texto da pergunta
- `imagem`: URL da imagem (opcional)
- `dica`: Dica para a pergunta
- `a1` a `a5`: Alternativas
- `ac`: Alternativa correta (1-5)

## 🔌 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login do usuário
- `GET /api/auth/verify` - Verificar token

### Perguntas
- `GET /api/questions/available` - Perguntas disponíveis
- `POST /api/questions/answer` - Responder pergunta
- `GET /api/questions/stats` - Estatísticas do usuário

### Usuários
- `GET /api/users/turma` - Dados da turma
- `GET /api/users/profile` - Perfil do usuário

### Ranking
- `GET /api/ranking/turmas` - Ranking completo de turmas
- `GET /api/ranking/top3` - Top 3 turmas
- `GET /api/ranking/turma/:turma/:escola` - Posição de turma específica

## 🎯 Lógica de Negócio

### Liberação de Perguntas
- **Dia 1**: Pergunta 1 liberada
- **Dia 2**: Perguntas 1 e 2 liberadas
- **Dia 3**: Perguntas 1, 2 e 3 liberadas
- **Dia 4**: Perguntas 1, 2, 3 e 4 liberadas
- **Dia 5**: Todas as perguntas liberadas

### Sistema de XP
- **Acerto**: +50 XP
- **Erro**: +1 erro (sem perda de XP)
- **Nível**: Calculado por XP / 500

### Preview de Próxima Pergunta
- Se o usuário já respondeu todas as perguntas disponíveis
- Mostra apenas a dica da próxima pergunta

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Servidor
PORT=3001
NODE_ENV=development

# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ga_quiz_db
DB_PORT=3306

# Segurança
JWT_SECRET=ga_quiz_secret_key_2024_bahia_education
BCRYPT_ROUNDS=10
```

## 📊 Dados de Exemplo

### Usuários Criados
- `aluno001` a `aluno010` - 10 usuários de exemplo
- Senhas: Qualquer senha (modo teste)
- Turmas: 3ª Série A, 3ª Série B, 2ª Série A, 3ª Série C
- Escolas: Colégio Estadual da Bahia, Colégio Modelo

### Perguntas Criadas
- **100 perguntas** de matemática básica
- Categorias: Soma, Subtração, Multiplicação, Divisão
- Dificuldade: Básica a intermediária

## 🧪 Testando a API

### 1. Testar conexão
```bash
curl http://localhost:3001/api/test
```

### 2. Fazer login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login": "aluno001", "senha": "123456"}'
```

### 3. Buscar perguntas disponíveis
```bash
curl http://localhost:3001/api/questions/available \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🚀 Deploy

1. **Configurar variáveis de ambiente**
2. **Executar migrações**: `npm run init-db`
3. **Iniciar servidor**: `npm start`

## 📝 Logs

O servidor exibe logs detalhados:
- Conexão com banco de dados
- Requisições recebidas
- Erros e exceções
- Estatísticas de uso

## 🔒 Segurança

- **JWT**: Autenticação baseada em tokens
- **Rate Limiting**: Limite de requisições por IP
- **Helmet**: Headers de segurança
- **CORS**: Configurado para frontend
- **Validação**: Dados validados em todas as rotas

## 🐛 Troubleshooting

### Erro de conexão com MySQL
- Verificar se MySQL está rodando
- Verificar credenciais no `.env`
- Verificar se a porta 3306 está livre

### Erro de permissão
- Verificar se o usuário MySQL tem permissões
- Criar banco de dados manualmente se necessário

### Token inválido
- Verificar se o token está sendo enviado corretamente
- Verificar se o JWT_SECRET está configurado

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do servidor
2. Verificar conexão com banco de dados
3. Verificar configurações de ambiente 