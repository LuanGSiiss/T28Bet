# F6 — Liquidação Automática: Tarefas

## Dependências

Depende de: F1 (auth/admin), F2 (Match), F3 (Bet, Transaction)

## Tarefas

### T1 — Middleware requireAdmin
**Onde:** `backend/src/middlewares/admin.ts`
**O que:** Verificar `req.user.isAdmin === true`. Retornar 403 se não.
**Gate:** rota admin retorna 403 para usuário comum; 200 para admin

### T2 — `POST /api/admin/matches/:id/result`
**Onde:** `backend/src/routes/admin.ts`
**O que:** Validar winner → verificar se já tem resultado → atualizar match → chamar `settleMatch(matchId, winner)` → retornar `{ settled, totalPrizePaid }`
**Gate:** 200 com apostas liquidadas; 409 em resultado duplicado

### T3 — Função `settleMatch`
**Onde:** `backend/src/services/settlement.ts`
**O que:** Buscar apostas `{ matchId, status: "pending" }` → para cada uma: comparar market com winner → atualizar status, actualReturn → `$inc` saldo → criar Transaction `"prize"` ou nenhuma para perdedoras
**Gate:** apostas ganhadoras com `status: "won"` e saldo creditado; perdedoras com `status: "lost"`

## Ordem

T1 → T2 → T3
