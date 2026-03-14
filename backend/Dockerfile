FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache netcat-openbsd
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

EXPOSE 5000

#  WAIT → MIGRATE → START
CMD ["sh", "-c", "./wait-for-postgres.sh && pnpm db:migrate && pnpm dev"]