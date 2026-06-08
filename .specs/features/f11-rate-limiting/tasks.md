# F11 — Rate Limiting: Tarefas

## Dependências

```bash
npm install express-rate-limit rate-limit-redis
```
Depende de: F9/F10 (Redis client)

## Tarefas

### T1 — Rate limiter para login
**Onde:** `backend/src/routes/auth.ts`
**O que:** `rateLimit({ windowMs: 15*60*1000, max: 10, store: new RedisStore(...) })` aplicado em `POST /api/auth/login`
**Gate:** 11ª chamada → 429 com Retry-After

### T2 — Rate limiter para apostas
**Onde:** `backend/src/routes/bets.ts`
**O que:** `rateLimit({ windowMs: 1000, max: 10, keyGenerator: (req) => req.user.id })` aplicado em `POST /api/bets`
**Gate:** 11ª aposta em burst → 429
