# Dockerfile único para frontend y backend
FROM node:20.17.0-alpine

# Crear directorio de trabajo
WORKDIR /app

# Instalar concurrently globalmente para ejecutar ambos procesos
RUN npm install -g concurrently

# Copiar package.json del frontend
COPY package*.json ./

# Instalar dependencias del frontend
RUN npm install

# Copiar package.json del backend
COPY server/package*.json ./server/

# Instalar dependencias del backend
WORKDIR /app/server
RUN npm install

# Volver al directorio raíz
WORKDIR /app

# Copiar todo el código fuente
COPY . .

# Exponer puertos (3001 para backend, 5173 para frontend)
EXPOSE 3001 5173

# Comando para ejecutar ambos servicios
CMD ["concurrently", "--kill-others", "--prefix", "[{name}]", "--names", "BACKEND,FRONTEND", "cd server && npm run dev", "npm run dev -- --host 0.0.0.0"]
