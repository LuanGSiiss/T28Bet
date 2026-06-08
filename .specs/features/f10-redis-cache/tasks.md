# F10 — Cache Redis: Tarefas

## Dependências

ioredis já instalado na F9. Depende de: F2 (Match routes), F9 (Redis client)

## Tarefas

### T1 — Middleware de cache genérico
**Onde:** `backend/src/middlewares/cache.ts`
**O que:** Função `cacheMiddleware(key, ttl)` — verifica Redis, retorna hit ou passa adiante e armazena resposta

### T2 — Cache em GET /api/matches
**Onde:** `backend/src/routes/matches.ts`
**O que:** Aplicar `cacheMiddleware("cache:matches", 5)` antes do handler. Invalidar cache no PATCH de odds.
**Gate:** segunda chamada → log "cache hit"; PATCH odds → cache invalidado

### T3 — Cache em GET /api/matches/:id
**Onde:** `backend/src/routes/matches.ts`
**O que:** `cacheMiddleware("cache:match:<id>", 5)`. Invalidar no PATCH de odds da partida.
**Gate:** hit na segunda chamada

### T4 — Fallback MongoDB quando Redis indisponível
**Onde:** `backend/src/middlewares/cache.ts`
**O que:** try/catch em toda operação Redis → logar erro → chamar `next()` se Redis falhar
**Gate:** derrubar Redis → GET /api/matches ainda funciona
