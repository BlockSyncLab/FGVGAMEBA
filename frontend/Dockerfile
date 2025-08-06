# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código da aplicação
COPY . .

# Build da aplicação
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Instalar serve para servir arquivos estáticos
RUN npm install -g serve

# Copiar arquivos buildados
COPY --from=build /app/dist ./dist

# Expor porta
EXPOSE 80

# Comando para iniciar o servidor
CMD ["serve", "-s", "dist", "-l", "80"] 