FROM node:20-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Build-time env for Next.js
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
# ENV NODE_ENV=production
# ENV PORT=3000

# Install deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy source
COPY . .

# Build Next.js
RUN pnpm build

EXPOSE 3000

# Run production server
CMD ["pnpm", "start", "-p", "3000"]
