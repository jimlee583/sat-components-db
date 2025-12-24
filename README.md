# Satellite Components DB (FastAPI + SQLAlchemy + Alembic + Postgres)

A small demo project to learn:
- SQLAlchemy 2.x ORM models + relationships (parent/child components)
- Alembic migrations
- Running Postgres locally with Docker Compose
- Running FastAPI in Docker, connected to Postgres

## Quick start (Docker)
1) Start services:
   docker compose up --build

2) Open API docs:
   http://localhost:8080/docs

3) Seed example data:
   POST http://localhost:8080/components/seed

4) List root components:
   GET http://localhost:8080/components?roots_only=true

## Quick start (local Python, using Docker Postgres)
1) Start Postgres only:
   docker compose up db

2) Create venv + install:
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt

3) Run migrations:
   alembic upgrade head

4) Run API:
   uvicorn app.main:app --reload --port 8080

## Useful endpoints
- POST /components
- GET /components
- GET /components/{id}
- GET /components/{id}/tree
- POST /components/seed
