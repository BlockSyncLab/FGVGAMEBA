# 🚀 **Configuração AWS RDS PostgreSQL para GA Quiz**

## **📋 Informações Necessárias da AWS**

### **1. Dados do Banco RDS**
Você precisa fornecer estas informações do seu banco RDS PostgreSQL:

```bash
# Endpoint do banco (ex: quiz-db.abc123.us-east-1.rds.amazonaws.com)
DB_HOST=game-postgres.chykacyyar03.us-east-2.rds.amazonaws.com

# Nome do banco de dados
DB_NAME=game-postgres

# Usuário do banco
DB_USER=ZIGOMES

# Senha do banco
DB_PASSWORD=Vampiro5!

# Porta (padrão PostgreSQL: 5432)
DB_PORT=5432

# SSL (true para produção, false para desenvolvimento)
DB_SSL=true
```

### **2. Configurações de Segurança**

#### **Security Groups**
- **Porta 5432** deve estar aberta para o IP do seu servidor
- **Source**: Seu IP ou 0.0.0.0/0 (apenas para desenvolvimento)

#### **Subnet Groups**
- Deve estar em **subnets privadas** (recomendado)
- Ou em **subnets públicas** se necessário

### **3. Configurações do Banco**

#### **Parâmetros Recomendados**
```sql
-- Performance
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

-- Logs
log_statement = 'all'
log_min_duration_statement = 1000
```

#### **Backup e Manutenção**
- **Backup automático**: Habilitado
- **Retenção**: 7 dias
- **Janela de manutenção**: 03:00-04:00 UTC

## **🔧 Passos para Configuração**

### **1. Criar Banco RDS**
1. Acesse AWS Console → RDS
2. Clique "Create database"
3. Escolha "PostgreSQL"
4. Versão: **PostgreSQL 15** (recomendado)
5. Template: **Free tier** (desenvolvimento) ou **Production**
6. Configurações:
   - **DB instance identifier**: `ga-quiz-db`
   - **Master username**: `admin`
   - **Master password**: `[senha forte]`

### **2. Configurar Security Group**
1. Vá para EC2 → Security Groups
2. Crie novo security group para RDS
3. Adicione regra:
   - **Type**: PostgreSQL
   - **Port**: 5432
   - **Source**: Seu IP ou 0.0.0.0/0

### **3. Configurar Subnet**
1. Vá para VPC → Subnets
2. Certifique-se que as subnets estão em AZs diferentes
3. Configure route tables adequadamente

### **4. Testar Conexão**
```bash
# Instalar cliente PostgreSQL
sudo apt-get install postgresql-client

# Testar conexão
psql -h [DB_HOST] -U [DB_USER] -d [DB_NAME]
```

## **⚠️ Considerações de Segurança**

### **Produção**
- ✅ Use **subnets privadas**
- ✅ Configure **VPC endpoints**
- ✅ Use **IAM authentication** se possível
- ✅ Habilite **encryption at rest**
- ✅ Configure **backup cross-region**

### **Desenvolvimento**
- ⚠️ Pode usar subnets públicas
- ⚠️ IP 0.0.0.0/0 para facilitar desenvolvimento
- ⚠️ SSL opcional

## **💰 Custos Estimados**

### **Free Tier (12 meses)**
- **db.t3.micro**: $0/mês
- **Storage**: 20GB incluído
- **Backup**: 20GB incluído

### **Produção (db.t3.small)**
- **Instância**: ~$15/mês
- **Storage**: ~$2.30/GB/mês
- **Backup**: ~$0.05/GB/mês
- **Data Transfer**: ~$0.09/GB

## **📱 Próximos Passos**

1. ✅ Configure o banco RDS na AWS
2. ✅ Colete as informações de conexão
3. ✅ Configure as variáveis de ambiente
4. ✅ Execute o script de migração
5. ✅ Teste a conexão
6. ✅ Atualize o código para PostgreSQL

## **🆘 Suporte**

Se precisar de ajuda:
- AWS RDS Documentation
- AWS Support (se tiver plano)
- Stack Overflow
- PostgreSQL Documentation


