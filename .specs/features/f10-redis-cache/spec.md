# F10 — Cache Redis para Odds e Partidas: Especificação

## Problem Statement

Endpoints de listagem de partidas e odds são chamados frequentemente por muitos usuários simultâneos. Sem cache, cada requisição bate no MongoDB, criando carga desnecessária e latência.

## Goals

- [ ] `GET /api/matches` servido do Redis com TTL de 5s (RNF03)
- [ ] Invalidação de cache imediata quando odds ou status são atualizados
- [ ] Reduzir queries ao MongoDB em > 80% para listagem de partidas

## Out of Scope

| Feature | Reason |
|---|---|
| Cache de apostas individuais | Dados pessoais — não cacheáveis globalmente |
| Cache distribuído multi-node | Redis single-node é suficiente para MVP |
| Cache de sessão de usuário | JWT stateless não precisa de sessão no servidor |

---

## User Stories

### P1: Cache de listagem de partidas ⭐ MVP

**User Story**: Como sistema, quero servir a listagem de partidas do Redis para reduzir latência e carga no banco.

**Acceptance Criteria**:

1. WHEN `GET /api/matches` é chamado THEN sistema SHALL verificar chave `cache:matches` no Redis
2. WHEN cache hit THEN sistema SHALL retornar dados do Redis sem consultar MongoDB
3. WHEN cache miss THEN sistema SHALL consultar MongoDB, armazenar resultado no Redis com `TTL: 5s` e retornar
4. WHEN odds de uma partida são atualizadas THEN sistema SHALL invalidar `cache:matches` imediatamente (não aguardar TTL)
5. WHEN Redis está indisponível THEN sistema SHALL fazer fallback para MongoDB e logar o erro (não quebrar a requisição)

**Independent Test**: GET matches → logar "cache miss" → GET imediato → logar "cache hit" (sem query MongoDB).

---

### P1: Cache de odds por partida ⭐ MVP

**User Story**: Como sistema, quero cachear odds de partidas individuais para servir atualizações rápidas.

**Acceptance Criteria**:

1. WHEN `GET /api/matches/:id` é chamado THEN sistema SHALL verificar `cache:match:<id>`
2. WHEN cache hit THEN retornar do Redis
3. WHEN cache miss THEN buscar no MongoDB, cachear com `TTL: 5s`
4. WHEN odds são atualizadas via PATCH THEN invalidar `cache:match:<id>` e `cache:matches`

**Independent Test**: GET match/:id → hit no Redis na segunda chamada.

---

## Estratégia de Chaves Redis

| Chave | TTL | Invalidado quando |
|---|---|---|
| `cache:matches` | 5s | Odds ou status de qualquer partida mudam |
| `cache:match:<id>` | 5s | Odds ou status desta partida mudam |

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| CACHE-01 | Cache listagem partidas | RNF03 | Pending |
| CACHE-02 | Cache partida individual | RNF03 | Pending |
| CACHE-03 | Invalidação ao atualizar | RNF03 | Pending |
| CACHE-04 | Fallback MongoDB | RNF03 | Pending |

---

## Success Criteria

- [ ] Segunda requisição de listagem vem do Redis (log "cache hit")
- [ ] Atualizar odds → próximo GET já tem odds novas (cache invalidado)
- [ ] Desligar Redis → API ainda funciona (fallback)
