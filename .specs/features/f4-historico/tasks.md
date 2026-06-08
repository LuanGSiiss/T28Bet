# F4 — Histórico de Apostas: Tarefas

## Dependências

Depende de: F1 (auth), F3 (Bet model)

## Tarefas

### T1 — `GET /api/bets`
**Onde:** `backend/src/routes/bets.ts`
**O que:** Buscar apostas do `req.user.id`, popular `matchId` com dados da partida, ordenar por `createdAt` desc
**Gate:** retorna apostas com `match.homeTeam` e `match.awayTeam` populados

### T2 — `GET /api/bets/:id`
**Onde:** `backend/src/routes/bets.ts`
**O que:** Buscar aposta por ID, verificar `userId === req.user.id`
**Gate:** 200 com dados; 403 para aposta de outro usuário; 404 não encontrada

### T3 — Frontend: página de histórico
**Onde:** `frontend/src/pages/BetHistory.tsx`
**O que:** Tabela com colunas: Partida, Mercado, Valor, Odds, Retorno Potencial, Status, Data. Badge colorido por status.
**Gate:** apostas listadas na UI; status com cores distintas (pendente=amarelo, ganha=verde, perdida=vermelho)

## Ordem

T1 → T2 (backend) → T3 (frontend)
