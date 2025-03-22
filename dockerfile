FROM node:lts-alpine

RUN npm install -g http-server

WORKDIR /app

COPY kamis-fe/package*.json ./

RUN npm install

COPY kamis-fe .

RUN npx vite build

EXPOSE 5173

CMD ["http-server", "dist"]