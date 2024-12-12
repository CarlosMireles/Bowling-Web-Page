# Usa una imagen oficial de Node.js como base
FROM node:16

# Configura el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de tu aplicación al contenedor
COPY . .

# Expone el puerto en el que tu aplicación escucha (por ejemplo, 80 o 3000)
EXPOSE 80

# Define el comando por defecto para iniciar tu aplicación
CMD ["npm", "start"]