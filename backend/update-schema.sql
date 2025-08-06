-- Script para adicionar novos campos à tabela users
-- Execute este script para atualizar o banco de dados existente

-- Adicionar campos para rastrear respostas
ALTER TABLE users ADD COLUMN respostas_incorretas INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN respostas_atrasadas INTEGER DEFAULT 0;

-- Verificar se os campos foram adicionados
SELECT name FROM pragma_table_info('users') WHERE name IN ('respostas_incorretas', 'respostas_atrasadas');

-- Mostrar estrutura atualizada da tabela
PRAGMA table_info(users); 