.PHONY: help build up down logs shell migrate studio clean dev prod

help:
	@echo "Largence Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev          Start development database & redis"
	@echo "  make studio       Start Prisma Studio"
	@echo "  make dev-down     Stop development services"
	@echo ""
	@echo "Production:"
	@echo "  make build        Build all Docker images"
	@echo "  make up           Start all production services"
	@echo "  make down         Stop all production services"
	@echo "  make migrate      Run database migrations"
	@echo "  make logs         View logs from all services"
	@echo "  make logs-app     View logs from app service"
	@echo ""
	@echo "Utilities:"
	@echo "  make shell        Open shell in app container"
	@echo "  make clean        Remove all containers and volumes"
	@echo "  make rebuild      Rebuild and restart all services"

dev:
	docker-compose -f docker-compose.dev.yml up -d

studio:
	docker-compose -f docker-compose.dev.yml --profile studio up -d prisma-studio

dev-down:
	docker-compose -f docker-compose.dev.yml down

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

migrate:
	docker-compose --profile migrate run --rm migrate

logs:
	docker-compose logs -f

logs-app:
	docker-compose logs -f app

logs-web:
	docker-compose logs -f web

shell:
	docker-compose exec app sh

shell-db:
	docker-compose exec db psql -U $${POSTGRES_USER:-largence} -d $${POSTGRES_DB:-largence}

clean:
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans

rebuild: down build up

build-app:
	docker build -t largence/app:latest -f Dockerfile .

build-web:
	docker build -t largence/web:latest -f Dockerfile.web .

push:
	docker push largence/app:latest
	docker push largence/web:latest
