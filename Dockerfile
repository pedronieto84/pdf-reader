# Dockerfile para Firebase App Hosting (Cloud Run)
FROM node:20.17.0-alpine

# Crear directorio de trabajo
WORKDIR /app

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

# Construir el frontend para producción
RUN npm run build

# Compilar el backend TypeScript
WORKDIR /app/server
RUN npm run build

# Volver al directorio raíz
WORKDIR /app

# Usar el puerto dinámico de Cloud Run
ENV PORT=8080

# Exponer el puerto dinámico
EXPOSE $PORT

# Comando para ejecutar solo el backend (que servirá también el frontend)
CMD ["node", "server/dist/index.js"]
