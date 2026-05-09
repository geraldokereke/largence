# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY .prettierrc .editorconfig ./

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate --schema=src/prisma/schema.prisma

# Build the app
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -S largence && adduser -S largence -G largence
USER largence

# Copy built assets and production dependencies
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3001/auth/health || exit 1

CMD ["node", "dist/main"]
