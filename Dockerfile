FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY server ./server
COPY migrations ./migrations

EXPOSE 3000

CMD ["node", "server/src/server.js"]