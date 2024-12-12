# Usa una imagen oficial de Node.js como base
FROM node:18

WORKDIR /app/
# Configura el directorio de trabajo dentro del contenedor

# Copia el archivo package.json y package-lock.json (si existe)

RUN mkdir -p ./public ./views

COPY package*.json ./
COPY public/ ./public/
COPY views/ ./views/
COPY server.js ./

# Instala las dependencias
RUN npm install

# Crea las carpetas necesarias para mantener la estructura

# Expone el puerto en el que tu aplicación escucha (por ejemplo, 80 o 3000)
EXPOSE 80

# Define el comando por defecto para iniciar tu aplicación
CMD ["npm", "start"]
