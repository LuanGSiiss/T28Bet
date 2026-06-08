# F19 — Detalhe da Partida: Tarefas

## Dependências

Depende de: F2 (Match model + routes), F8 (PATCH odds grava oddsHistory)

## Tarefas

### T1 — Gravar oddsHistory ao atualizar odds
**Onde:** `backend/src/routes/admin.ts` (PATCH odds)
**O que:** Antes de salvar, `$push: { oddsHistory: { odds: novasOdds, recordedAt: new Date() } }`
**Gate:** PATCH odds 3x → `match.oddsHistory` tem 3 registros

### T2 — Incluir oddsHistory no GET /api/matches/:id
**Onde:** `backend/src/routes/matches.ts`
**O que:** Retornar `oddsHistory` ordenado decrescente na resposta (já está embedded no documento)
**Gate:** GET match/:id → campo `oddsHistory` presente com histórico

### T3 — Frontend: página /matches/:id
**Onde:** `frontend/src/pages/MatchDetail.tsx`
**O que:** Exibir dados da partida + tabela de histórico de odds (coluna: data/hora, casa, empate, fora). Se status `finished`, exibir resultado em badge colorido.
**Gate:** acessar /matches/:id → tabela histórica exibida

### T4 — Roteamento e link na listagem
**Onde:** `frontend/src/pages/Matches.tsx`, `frontend/src/App.tsx`
**O que:** Cada partida na listagem tem botão/link "Ver detalhe" → `/matches/:id`
**Gate:** clique → navega para detalhe
