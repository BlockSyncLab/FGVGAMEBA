# Atualizações do Sistema GA Quiz

## Mudanças Implementadas

### 1. Novos Campos na Tabela de Usuários

Foram adicionados dois novos campos na tabela `users` para rastrear:
- `respostas_incorretas`: Conta quantas vezes o usuário respondeu incorretamente
- `respostas_atrasadas`: Conta quantas vezes o usuário respondeu corretamente mas com atraso

### 2. Sistema de Perguntas do Dia

O sistema agora funciona baseado na tabela `campanha_config`:
- Cada dia (fuso horário do Brasil) uma nova pergunta é liberada
- O dia é calculado baseado na data de início da campanha
- Ex: Se a campanha começou hoje, é dia 1 (pergunta q1)
- No dia seguinte, automaticamente vira dia 2 (pergunta q2)
- E assim por diante até o dia 5

### 3. Modal Horizontal de Contagem Regressiva

Foi implementado um modal horizontal que mostra:
- Tempo restante até a próxima pergunta
- Dica da próxima pergunta
- Atualização em tempo real (contador regressivo)

### 4. Dica da Próxima Pergunta na Mensagem de Acerto

Quando o usuário acerta uma pergunta, a mensagem de sucesso agora inclui:
- A dica da próxima pergunta disponível
- Formato: "Correto! Você ganhou X XP! [mensagem] \n\n💡 Dica da próxima pergunta: [dica]"
- Funciona apenas quando há uma próxima pergunta disponível (dias 1-4)

## Como Aplicar as Mudanças

### 1. Atualizar o Banco de Dados

Execute o script de atualização:

```bash
cd backend
node update-db.js
```

### 2. Reiniciar o Backend

```bash
cd backend
npm start
```

### 3. Reiniciar o Frontend

```bash
cd frontend
npm run dev
```

## Funcionalidades Implementadas

### Backend

1. **Novos campos na tabela users**:
   - `respostas_incorretas`: Incrementa quando o usuário erra
   - `respostas_atrasadas`: Incrementa quando acerta mas está atrasado

2. **Nova rota `/questions/next-question-info`**:
   - Retorna informações da próxima pergunta
   - Calcula tempo restante baseado no fuso horário do Brasil
   - Fornece dica da próxima pergunta

3. **Atualização da lógica de resposta**:
   - Conta respostas incorretas e atrasadas
   - Mantém compatibilidade com sistema existente

### Frontend

1. **Modal horizontal de contagem regressiva**:
   - Posicionado na parte inferior da tela
   - Mostra tempo restante em formato HH:MM:SS
   - Exibe dica da próxima pergunta
   - Atualização em tempo real

2. **Integração com API**:
   - Nova função `getNextQuestionInfo()` no serviço de API
   - Timer que atualiza a cada segundo
   - Recarrega automaticamente quando o tempo esgota

3. **Mensagem de acerto aprimorada**:
   - Inclui dica da próxima pergunta quando disponível
   - Formatação melhorada com emoji e quebras de linha
   - Mantém compatibilidade com sistema existente

## Estrutura dos Dados

### Tabela users (novos campos)
```sql
respostas_incorretas INTEGER DEFAULT 0
respostas_atrasadas INTEGER DEFAULT 0
```

### Tabela campanha_config
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
data_inicio DATE NOT NULL
duracao_dias INTEGER NOT NULL
ativo BOOLEAN DEFAULT 1
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

## Observações

- O sistema mantém total compatibilidade com dados existentes
- Os novos campos são inicializados com 0 para usuários existentes
- O modal só aparece quando há próxima pergunta disponível
- O timer é baseado no fuso horário do Brasil (America/Sao_Paulo) 