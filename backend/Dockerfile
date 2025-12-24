FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

RUN pip install --no-cache-dir uv

COPY pyproject.toml uv.lock ./

# Configure the environment to use the uv-created virtual environment
ENV PATH="/app/.venv/bin:$PATH"

# Install dependencies using uv
RUN uv sync --frozen --no-dev

COPY . .

# Run migrations from / so /app/alembic doesn't shadow the installed Alembic package
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
