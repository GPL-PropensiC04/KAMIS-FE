FROM node:lts-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Use lightweight server
FROM node:lts-alpine AS serve
RUN npm install -g http-server
WORKDIR /app
COPY --from=build /app/dist dist

EXPOSE 80
CMD ["http-server", "dist", "-p", "80"]
