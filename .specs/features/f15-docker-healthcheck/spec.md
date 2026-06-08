# F15 — Docker Compose Completo + Health Checks: Especificação

## Problem Statement

Para que o sistema rode localmente como um todo (backend, frontend, MongoDB, Redis, ElasticMQ) e para que o Kubernetes (Fase 5) possa gerenciar o ciclo de vida dos pods, todos os serviços precisam de orquestração local e endpoints de saúde.

## Goals

- [ ] `docker compose up` sobe todo o ambiente em < 2 minutos
- [ ] Todos os serviços expõem `/health` e `/ready` para probes do Kubernetes (RNF12)
- [ ] Serviços aguardam dependências estarem saudáveis antes de iniciar (healthcheck + depends_on)

## Out of Scope

| Feature | Reason |
|---|---|
| Docker Compose para produção | Kubernetes cobre isso (Fase 5) |
| Build multi-stage otimizado | Foco em funcionalidade, não tamanho de imagem |
| Secrets management (Vault) | `.env` é suficiente para dev local |

---

## User Stories

### P1: Docker Compose completo ⭐ MVP

**User Story**: Como desenvolvedor, quero subir todo o ambiente com um único comando para desenvolver e demonstrar o sistema.

**Acceptance Criteria**:

1. WHEN `docker compose up -d` THEN todos os serviços SHALL iniciar: `backend`, `frontend`, `mongo`, `redis`, `elasticmq`
2. WHEN backend inicia THEN SHALL aguardar MongoDB e Redis estarem saudáveis (depends_on + healthcheck)
3. WHEN qualquer serviço falha THEN `docker compose ps` SHALL mostrar status `unhealthy` ou `exited`
4. WHEN `docker compose down` THEN todos os containers SHALL ser removidos sem erro

**Independent Test**: `docker compose up -d && docker compose ps` → todos os serviços com status `running` ou `healthy`.

---

### P1: Endpoints de saúde ⭐ MVP

**User Story**: Como operador/Kubernetes, quero endpoints `/health` e `/ready` no backend para monitorar o serviço.

**Acceptance Criteria**:

1. WHEN `GET /health` THEN sistema SHALL retornar `200 { status: "ok", uptime: X }`
2. WHEN `GET /ready` THEN sistema SHALL verificar conexão com MongoDB e Redis e retornar `200 { status: "ready", checks: { mongo: "ok", redis: "ok" } }`
3. WHEN MongoDB está indisponível THEN `GET /ready` SHALL retornar `503 { status: "not ready", checks: { mongo: "error" } }`
4. WHEN Redis está indisponível THEN `GET /ready` SHALL retornar `503` com `redis: "error"`

**Independent Test**: Derrubar MongoDB → GET /ready → 503 com mongo: "error".

---

## Estrutura docker-compose.yml

```yaml
services:
  mongo:       # MongoDB 7, healthcheck: mongosh ping
  redis:       # Redis 7, healthcheck: redis-cli ping
  elasticmq:   # ElasticMQ (SQS local)
  backend:     # depends_on: [mongo, redis], healthcheck: GET /health
  frontend:    # depends_on: [backend]
```

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| INFRA-01 | Docker Compose completo | RNF12 | Pending |
| INFRA-02 | GET /health | RNF12 | Pending |
| INFRA-03 | GET /ready com checks | RNF12 | Pending |
| INFRA-04 | depends_on + healthcheck | RNF12 | Pending |

---

## Success Criteria

- [ ] `docker compose up -d` → todos os serviços healthy em < 2min
- [ ] `GET /ready` → 200 quando tudo ok, 503 quando dependência cai
- [ ] `docker compose down && docker compose up -d` → sistema reinicia limpo
