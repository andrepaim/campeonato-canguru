# ── Stage 1: build frontend ───────────────────────────────────────────────────
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts \
     tailwind.config.js postcss.config.js eslint.config.js ./
COPY src/ src/
COPY public/ public/
RUN npm run build

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ backend/
COPY --from=frontend-build /app/dist/ dist/
RUN mkdir -p data
WORKDIR /app/backend
EXPOSE 3202
CMD ["python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3202"]
