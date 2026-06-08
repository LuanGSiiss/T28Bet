# F18 — Logs Estruturados: Tarefas

## Dependências

```bash
npm install pino pino-http
npm install --save-dev @types/pino
```

## Tarefas

### T1 — Instanciar logger Pino
**Onde:** `backend/src/logger.ts`
**O que:** `export const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' })`

### T2 — Middleware pino-http
**Onde:** `backend/src/index.ts`
**O que:** `app.use(pinoHttp({ logger }))` antes de todas as rotas. Loga method, path, statusCode, durationMs, requestId (gerado automaticamente)

### T3 — Substituir console.log por logger
**Onde:** Todos os arquivos do backend
**O que:** `logger.info(...)`, `logger.error({ err, requestId }, "mensagem")`

### T4 — Error handler global com log estruturado
**Onde:** `backend/src/index.ts`
**O que:** `app.use((err, req, res, next) => { logger.error({ err, requestId: req.id }, 'Unhandled error'); res.status(500).json(...) })`
**Gate:** erro no handler → log JSON com `stack` e `requestId`
