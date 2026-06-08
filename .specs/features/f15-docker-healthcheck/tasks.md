# F15 — Docker Compose + Health Checks: Tarefas

## Tarefas

### T1 — `GET /health` no backend
**Onde:** `backend/src/index.ts`
**O que:** `app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }))`
**Gate:** 200 em qualquer estado

### T2 — `GET /ready` no backend
**Onde:** `backend/src/routes/health.ts`
**O que:** Ping MongoDB (`mongoose.connection.readyState === 1`) + Redis (`redis.ping()`) → 200 se ok, 503 se falhar
**Gate:** derrubar Redis → /ready retorna 503

### T3 — docker-compose.yml completo
**Onde:** `docker-compose.yml` (na raiz)
**O que:** Serviços `mongo`, `redis`, `elasticmq`, `backend`, `frontend` com healthchecks, depends_on, variáveis de ambiente via `.env`
```yaml
backend:
  healthcheck:
    test: ["CMD", "wget", "-qO-", "http://localhost:3001/health"]
    interval: 10s
    timeout: 5s
    retries: 3
```
**Gate:** `docker compose up -d` → todos os serviços healthy

### T4 — Dockerfile para backend
**Onde:** `backend/Dockerfile`
**O que:** Multi-stage: build TypeScript → imagem Node alpine final
**Gate:** `docker build -t t28bet-backend ./backend` sem erros

### T5 — Dockerfile para frontend
**Onde:** `frontend/Dockerfile`
**O que:** Build CRA → servir com nginx:alpine
**Gate:** `docker build -t t28bet-frontend ./frontend` sem erros

## Ordem

T1 → T2 → T3 → T4 → T5
