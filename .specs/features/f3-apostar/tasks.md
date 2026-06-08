# F3 — Realizar Aposta: Tarefas

## Dependências

```bash
# Nenhuma nova dependência
# Depende de: F1 (auth), F2 (Match model)
```

## Tarefas

### T1 — Modelo Bet
**Onde:** `backend/src/models/Bet.ts`
**Schema:** `{ userId, matchId, market, amount, odds, potentialReturn, status, actualReturn?, createdAt, settledAt? }`
**Gate:** modelo exportado

### T2 — Modelo Transaction (parcial)
**Onde:** `backend/src/models/Transaction.ts`
**Schema:** `{ userId, type, amount, description, relatedBetId?, createdAt }`
**Gate:** modelo exportado (será reusado em F5, F7)

### T3 — `POST /api/bets`
**Onde:** `backend/src/routes/bets.ts`
**O que:** Validar body → verificar status da partida → verificar saldo → debitar com `$inc` atômico → criar Bet → criar Transaction tipo `"bet"` → retornar `{ bet }`
**Gate:** 201 com bet; 400 em saldo insuficiente; 409 em partida encerrada

### T4 — Frontend: modal de aposta
**Onde:** `frontend/src/components/BetModal.tsx`
**O que:** Modal que abre ao clicar "Apostar". Campos: mercado (radio), valor. Cálculo do retorno potencial em tempo real. Botão confirmar.
**Gate:** retorno potencial calcula corretamente ao digitar valor

### T5 — Frontend: integração com POST /api/bets
**Onde:** `frontend/src/pages/Matches.tsx` + `BetModal.tsx`
**O que:** Chamar API, tratar erros, atualizar saldo no AuthContext após sucesso
**Gate:** apostar → saldo atualiza no header sem reload

## Ordem

T1 → T2 → T3 (backend) → T4 → T5 (frontend)
