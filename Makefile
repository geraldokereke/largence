.PHONY: setup keys db-init dev build hosts docker-up docker-down

setup:
	@echo "Setting up environment..."
	cp apps/api/.env.example apps/api/.env
	pnpm install
	$(MAKE) keys
	@echo "Setup complete. apps/api/.env has been populated with keys."

keys:
	@echo "Generating RSA keys for JWT..."
	openssl genrsa -out apps/api/private.pem 2048
	openssl rsa -in apps/api/private.pem -pubout -out apps/api/public.pem
	@echo "Injecting keys into .env..."
	@node -e "\
		const fs = require('fs'); \
		const priv = fs.readFileSync('apps/api/private.pem', 'utf8').trim().replace(/\n/g, '\\\n'); \
		const pub = fs.readFileSync('apps/api/public.pem', 'utf8').trim().replace(/\n/g, '\\\n'); \
		let env = fs.readFileSync('apps/api/.env', 'utf8'); \
		env = env.replace(/JWT_PRIVATE_KEY=\".*\"/, 'JWT_PRIVATE_KEY=\"' + priv + '\"'); \
		env = env.replace(/JWT_PUBLIC_KEY=\".*\"/, 'JWT_PUBLIC_KEY=\"' + pub + '\"'); \
		env = env.replace(/JWT_ACCESS_TTL=\".*\"/, 'JWT_ACCESS_TTL=\"15m\"'); \
		env = env.replace(/JWT_REFRESH_TTL=\".*\"/, 'JWT_REFRESH_TTL=\"7d\"'); \
		fs.writeFileSync('apps/api/.env', env); \
	"
	@rm apps/api/private.pem apps/api/public.pem
	@echo "Keys and TTLs injected into apps/api/.env"

hosts:
	@echo "Adding subdomains to /etc/hosts (requires sudo)..."
	@grep -q "abs.largence.com" /etc/hosts || echo "127.0.0.1 abs.largence.com app.largence.com" | sudo tee -a /etc/hosts
	@echo "Hosts file updated."

db-init:
	@echo "Initializing database..."
	cd apps/api && npx prisma migrate dev --name init --schema=src/prisma/schema.prisma
	cd apps/api && npx prisma generate --schema=src/prisma/schema.prisma

docker-up:
	@echo "Starting Docker environment..."
	docker compose up --build -d

docker-down:
	@echo "Stopping Docker environment..."
	docker compose down

dev:
	pnpm --filter @largence/api dev

build:
	pnpm --filter @largence/api build
