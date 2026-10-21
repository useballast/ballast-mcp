FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app /app

ENTRYPOINT ["node", "bin/index.mjs"]
