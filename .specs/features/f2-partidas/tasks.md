# F2 — Partidas e Odds: Tarefas

## Dependências

```bash
# Nenhuma nova dependência — mongoose já instalado na F1
```

## Tarefas

### T1 — Modelo Match
**Onde:** `backend/src/models/Match.ts`
**Schema:** `{ homeTeam, awayTeam, date, status, odds: { home, draw, away }, result?, oddsHistory[] }`
**Gate:** modelo exportado e importável

### T2 — Seed de partidas
**Onde:** `backend/src/scripts/seed.ts`
**O que:** 8 partidas da fase de grupos da Copa 2026 com odds realistas (ex: Brasil vs Argentina)
**Gate:** `npx ts-node src/scripts/seed.ts` → 8 documentos no MongoDB

### T3 — `GET /api/matches`
**Onde:** `backend/src/routes/matches.ts`
**O que:** Retorna todas as partidas. Protegida por authMiddleware.
**Gate:** 200 com array >= 8 partidas; 401 sem token

### T4 — `GET /api/matches/:id`
**Onde:** `backend/src/routes/matches.ts`
**Gate:** 200 com partida e odds; 404 para ID inexistente

### T5 — `PATCH /api/admin/matches/:id/odds`
**Onde:** `backend/src/routes/admin.ts`
**O que:** Atualiza odds + append em `oddsHistory`. Protegida por requireAdmin.
**Gate:** odds atualizadas + `oddsHistory` com novo registro

### T6 — Seed de usuário admin
**Onde:** `backend/src/scripts/seed.ts`
**O que:** Criar `admin@t28bet.com / admin123` com `isAdmin: true` se não existir
**Gate:** login com admin retorna token com `isAdmin: true`

### T7 — Frontend: página de listagem de partidas
**Onde:** `frontend/src/pages/Matches.tsx`
**O que:** Exibir lista de partidas com status, times, data e odds 1X2. Botão "Apostar" em partidas scheduled.
**Gate:** visual no browser, odds visíveis

## Ordem

T1 → T2 → T3 → T4 → T5 → T6 (backend sequencial) → T7 (frontend)
