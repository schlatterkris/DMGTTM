# ---- Builder ----
FROM python:3.12-slim AS builder
WORKDIR /app

RUN pip install --no-cache-dir uv
ENV UV_PROJECT_ENVIRONMENT=/opt/venv

COPY pyproject.toml ./
RUN uv sync --no-cache --frozen

# ---- Runtime ----
FROM python:3.12-slim AS runtime
WORKDIR /app

ENV PATH="/opt/venv/bin:$PATH"
COPY --from=builder /opt/venv /opt/venv

COPY . .

EXPOSE 6400
CMD ["python", "server_main.py", "--host", "0.0.0.0", "--port", "6400"]
