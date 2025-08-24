# Rate Limiting Baseado no Usuário

## Visão Geral

O sistema de rate limiting foi modificado para ser baseado no **ID do usuário** em vez do **IP**, permitindo que múltiplos usuários do mesmo IP participem da competição sem limitações.

## Como Funciona

### 1. Rate Limiting por Usuário
- **Limite**: 1000 requisições por usuário a cada 15 minutos
- **Identificação**: Baseada no ID do usuário extraído do JWT token
- **Fallback**: Se não autenticado, usa o IP como identificador

### 2. Rotas Protegidas
O rate limiting é aplicado apenas nas seguintes rotas:
- `/api/users/*` - Perfil e dados do usuário
- `/api/questions/*` - Perguntas e respostas
- `/api/ranking/*` - Rankings e posições
- `/api/campanha/*` - Configurações da campanha

### 3. Rotas Públicas
As seguintes rotas **NÃO** têm rate limiting:
- `/api/auth/login` - Login de usuários
- `/api/test` - Rota de teste da API

## Vantagens

### ✅ Para Competição
- **Múltiplos usuários por IP**: Famílias, escolas, laboratórios podem ter vários participantes
- **Competição justa**: Cada usuário tem seu próprio limite, independente do IP
- **Flexibilidade**: Usuários podem competir de qualquer local

### ✅ Para Segurança
- **Proteção contra abuso**: Limita requisições por usuário individual
- **Prevenção de spam**: Evita que um usuário sobrecarregue o sistema
- **Monitoramento**: Permite identificar usuários problemáticos

## Configuração

### Parâmetros Atuais
```javascript
const userRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 requests por usuário
  message: 'Muitas requisições deste usuário, tente novamente mais tarde.',
  keyGenerator: (req) => {
    // Usar ID do usuário se autenticado
    if (req.user && req.user.id) {
      return req.user.id;
    }
    // Usar IP como fallback
    return req.ip;
  }
});
```

### Como Ajustar

#### Aumentar Limite
```javascript
max: 2000, // 2000 requests por usuário
```

#### Diminuir Janela de Tempo
```javascript
windowMs: 5 * 60 * 1000, // 5 minutos
```

#### Desabilitar Completamente
Comente as linhas de aplicação do rate limiting:
```javascript
// app.use('/api/users', authenticatedRateLimit(userRateLimit), userRoutes);
// app.use('/api/questions', authenticatedRateLimit(userRateLimit), questionRoutes);
// etc...
```

## Teste

Para testar o rate limiting:

```bash
# Iniciar o servidor
npm start

# Em outro terminal, executar o teste
node test-rate-limiting.js
```

## Monitoramento

### Logs de Rate Limiting
Quando um usuário atinge o limite, você verá logs como:
```
⚠️ Rate limit excedido para usuário: user123
🚫 Requisição bloqueada: /api/questions/available
```

### Métricas Sugeridas
- Número de usuários que atingem o limite
- Rotas mais acessadas
- Padrões de uso por usuário

## Troubleshooting

### Problema: Usuários reclamando de bloqueios
**Solução**: Aumentar o limite `max` ou a janela de tempo `windowMs`

### Problema: Muitos usuários do mesmo IP sendo bloqueados
**Verificar**: Se o JWT token está sendo enviado corretamente no header `Authorization`

### Problema: Rate limiting não está funcionando
**Verificar**: 
1. Se o middleware está sendo aplicado nas rotas corretas
2. Se o JWT token é válido
3. Se o `req.user` está sendo definido corretamente

## Exemplo de Uso

### Cenário: Escola com Laboratório de Informática
- **30 computadores** no laboratório
- **30 alunos** fazendo login simultaneamente
- **Mesmo IP** para todos os computadores
- **Resultado**: Cada aluno tem seu próprio limite de 1000 requisições

### Cenário: Família em Casa
- **Pai, mãe e 2 filhos** participando
- **Mesmo IP** residencial
- **Resultado**: Cada membro da família tem seu próprio limite

## Histórico de Mudanças

### Antes (Rate Limiting por IP)
- ❌ Limite de 100 requisições por IP
- ❌ Múltiplos usuários do mesmo IP compartilhavam o limite
- ❌ Impedia competição justa

### Agora (Rate Limiting por Usuário)
- ✅ Limite de 1000 requisições por usuário
- ✅ Cada usuário tem seu próprio limite
- ✅ Permite competição justa entre usuários do mesmo IP

