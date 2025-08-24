-- Script de migração para expandir de 4 para 10 questões
-- Execute este script para atualizar o banco de dados existente

-- 1. Adicionar campos para questões 5-10
ALTER TABLE users ADD COLUMN id_q5 INTEGER;
ALTER TABLE users ADD COLUMN response_q5 BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN id_q6 INTEGER;
ALTER TABLE users ADD COLUMN response_q6 BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN id_q7 INTEGER;
ALTER TABLE users ADD COLUMN response_q7 BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN id_q8 INTEGER;
ALTER TABLE users ADD COLUMN response_q8 BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN id_q9 INTEGER;
ALTER TABLE users ADD COLUMN response_q9 BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN id_q10 INTEGER;
ALTER TABLE users ADD COLUMN response_q10 BOOLEAN DEFAULT 0;

-- 2. Adicionar timestamp da última resposta
ALTER TABLE users ADD COLUMN last_response_timestamp DATETIME;

-- 3. Atualizar configuração da campanha para 10 dias úteis
UPDATE campanha_config SET duracao_dias = 10 WHERE id = 1;

-- 4. Para usuários existentes, duplicar questões para preencher os novos campos
-- (Isso é temporário para análise inicial, como solicitado)
UPDATE users SET 
  id_q5 = id_q1,
  id_q6 = id_q2,
  id_q7 = id_q3,
  id_q8 = id_q4,
  id_q9 = id_q1,
  id_q10 = id_q2
WHERE id_q1 IS NOT NULL;

-- 5. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_questions ON users(id_q1, id_q2, id_q3, id_q4, id_q5, id_q6, id_q7, id_q8, id_q9, id_q10);
CREATE INDEX IF NOT EXISTS idx_users_responses ON users(response_q1, response_q2, response_q3, response_q4, response_q5, response_q6, response_q7, response_q8, response_q9, response_q10);
CREATE INDEX IF NOT EXISTS idx_users_last_response ON users(last_response_timestamp);


