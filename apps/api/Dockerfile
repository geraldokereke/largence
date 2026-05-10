# --- Build Stage ---
FROM node:24-slim AS builder

WORKDIR /app

# Install pnpm and openssl
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm

# Copy root lockfile and package.json
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api

# Generate Prisma Client (Explicitly point to the schema location)
WORKDIR /app/apps/api
RUN npx prisma generate --schema=src/prisma/schema.prisma

# Build the app
RUN npm run build

# --- Production Stage ---
FROM node:24-slim

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built artifacts and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/src/prisma ./apps/api/src/prisma

# Set working directory to the API app
WORKDIR /app/apps/api

EXPOSE 3001

# Run the app
CMD ["node", "dist/src/main"]
