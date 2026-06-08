# F6 — Liquidação Automática: Especificação

## Problem Statement

Quando um resultado de partida é registrado, o sistema precisa calcular automaticamente quais apostas ganharam, creditar os prêmios e atualizar o status das apostas — sem intervenção manual.

## Goals

- [ ] Todas as apostas pendentes de uma partida liquidadas em < 5 segundos após registro do resultado
- [ ] Saldo dos vencedores creditado automaticamente
- [ ] Apostas perdedoras marcadas como `lost` sem crédito

## Out of Scope

| Feature | Reason |
|---|---|
| Processamento via Lambda/SQS | F12/F13 (Fase 4) — aqui é síncrono |
| Liquidação parcial (mercados múltiplos) | Apenas 1X2 no MVP |
| Reversão de liquidação | Não exigido para MVP |
| Notificação push/email | F14 (Fase 4) |

---

## User Stories

### P1: Liquidar apostas ao registrar resultado ⭐ MVP

**User Story**: Como sistema, quando um resultado de partida é registrado, quero liquidar automaticamente todas as apostas pendentes para que os vencedores recebam seus prêmios.

**Why P1**: É o fechamento do ciclo da aposta — sem isso o produto não funciona.

**Acceptance Criteria**:

1. WHEN `POST /api/admin/matches/:id/result` com `{ winner: "home"|"draw"|"away" }` THEN sistema SHALL atualizar `match.status = "finished"` e `match.result.winner`
2. WHEN resultado registrado THEN sistema SHALL buscar todas as apostas com `matchId === id` e `status === "pending"`
3. WHEN `bet.market === result.winner` THEN sistema SHALL marcar aposta como `won`, calcular `actualReturn = bet.amount * bet.odds`, creditar no saldo do usuário e registrar transação `type: "prize"`
4. WHEN `bet.market !== result.winner` THEN sistema SHALL marcar aposta como `lost`, `actualReturn = 0`
5. WHEN partida já tem resultado registrado THEN sistema SHALL retornar `409` e não reliquisar
6. WHEN não há apostas pendentes para a partida THEN sistema SHALL retornar `200` com `{ settled: 0 }`

**Independent Test**: Criar 3 apostas (2 em `home`, 1 em `away`) → registrar resultado `home` → 2 apostas `won` com saldo creditado, 1 `lost`.

---

## Edge Cases

- WHEN resultado com `winner` fora de `["home","draw","away"]` THEN `400`
- WHEN usuário apostou e foi vencedor, mas saldo intermediário foi alterado THEN operação `$inc` MongoDB garante atomicidade
- WHEN liquidação falha parcialmente THEN logs de erro por aposta; não reverter as já processadas (idempotência na Fase 4)

---

## Contratos de API

### `POST /api/admin/matches/:id/result`
```
Header: Authorization: Bearer <token-admin>
Body:   { winner: "home" | "draw" | "away" }
200:    { match: Match, settled: number, totalPrizePaid: number }
404:    { message: "Partida não encontrada" }
409:    { message: "Resultado já registrado" }
400:    { message: "winner inválido" }
```

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| SETTLE-01 | Registrar resultado | RF09 | Pending |
| SETTLE-02 | Liquidar apostas ganhadoras | RF09 | Pending |
| SETTLE-03 | Creditar saldo vencedores | RF09, RF10 | Pending |
| SETTLE-04 | Marcar apostas perdedoras | RF09 | Pending |
| SETTLE-05 | Registrar transação prêmio | RF09, RF12 | Pending |

---

## Success Criteria

- [ ] Registrar resultado → apostas ganhas creditadas, perdidas marcadas lost
- [ ] Saldo do vencedor = saldo anterior + actualReturn
- [ ] Tentar liquidar mesma partida duas vezes → 409
