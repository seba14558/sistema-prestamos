FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# No especificar puerto fijo, Railway asignará uno dinámicamente
# El puerto se configurará via variable de entorno PORT

CMD ["npm", "start"]
