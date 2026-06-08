# F3 — Realizar Aposta: Especificação

## Problem Statement

Usuário selecionou uma partida e quer apostar. O sistema precisa debitar o saldo imediatamente, persistir a aposta e calcular o retorno potencial para exibição.

## Goals

- [ ] Aposta realizada em ≤ 2 segundos após confirmação
- [ ] Saldo debitado atomicamente (sem apostas além do saldo disponível)
- [ ] Retorno potencial calculado e exibido antes da confirmação

## Out of Scope

| Feature | Reason |
|---|---|
| Apostas combinadas (múltiplas seleções) | RF não exige para MVP |
| Aposta ao vivo (live betting) | Fora do escopo |
| Editar/cancelar aposta | Não exigido |
| Processamento via SQS | F12 (Fase 4) — aqui é síncrono |

---

## User Stories

### P1: Realizar aposta simples ⭐ MVP

**User Story**: Como usuário logado, quero selecionar um mercado (casa/empate/fora), informar um valor e confirmar a aposta para participar do resultado da partida.

**Why P1**: É o núcleo do produto.

**Acceptance Criteria**:

1. WHEN `POST /api/bets` com `{ matchId, market: "home"|"draw"|"away", amount }` e token válido THEN sistema SHALL debitar `amount` do saldo do usuário atomicamente, persistir aposta com status `pending` e retornar `{ bet: { id, matchId, market, amount, odds, potentialReturn, status } }`
2. WHEN `amount > balance` do usuário THEN sistema SHALL retornar `400` com `"Saldo insuficiente"` e NÃO debitar nada
3. WHEN `amount < 1` THEN sistema SHALL retornar `400` com `"Valor mínimo de aposta é 1 crédito"`
4. WHEN `status` da partida não é `scheduled` THEN sistema SHALL retornar `409` com `"Apostas encerradas para esta partida"`
5. WHEN partida não existe THEN sistema SHALL retornar `404`
6. WHEN aposta criada THEN `potentialReturn` SHALL ser `amount * odds[market]` arredondado 2 casas

**Independent Test**: POST aposta → saldo reduz → `GET /api/bets` lista a aposta com status `pending`.

---

### P1: Visualizar retorno potencial antes de confirmar ⭐ MVP

**User Story**: Como usuário, quero ver o retorno potencial antes de confirmar minha aposta para tomar uma decisão informada.

**Acceptance Criteria**:

1. WHEN usuário seleciona mercado e digita valor THEN frontend SHALL calcular e exibir `retorno potencial = valor × odd` em tempo real (sem chamada à API)
2. WHEN usuário confirma THEN frontend SHALL exibir modal de confirmação com `valor apostado`, `odd`, `retorno potencial`
3. WHEN aposta confirmada com sucesso THEN frontend SHALL atualizar saldo exibido e redirecionar para histórico

**Independent Test**: Selecionar mercado → digitar 100 → retorno exibido = 100 × odd corretamente.

---

## Edge Cases

- WHEN `amount` é string não-numérica THEN sistema SHALL retornar `400`
- WHEN `market` fora de `["home","draw","away"]` THEN sistema SHALL retornar `400`
- WHEN duas apostas simultâneas do mesmo usuário THEN Sistema SHALL usar transação MongoDB para garantir saldo correto (sem duplo débito além do saldo)
- WHEN `matchId` inválido (ObjectId mal formado) THEN sistema SHALL retornar `400`

---

## Modelo de Dados

### Bet (MongoDB)
```ts
{
  userId: ObjectId,
  matchId: ObjectId,
  market: "home" | "draw" | "away",
  amount: number,
  odds: number,           // snapshot da odd no momento da aposta
  potentialReturn: number,
  status: "pending" | "won" | "lost",
  createdAt: Date,
  settledAt?: Date
}
```

---

## Contratos de API

### `POST /api/bets`
```
Header: Authorization: Bearer <token>
Body:   { matchId: string, market: "home"|"draw"|"away", amount: number }
201:    { bet: { id, matchId, market, amount, odds, potentialReturn, status: "pending" } }
400:    { message: "Saldo insuficiente" | "Valor mínimo..." | "market inválido" }
404:    { message: "Partida não encontrada" }
409:    { message: "Apostas encerradas para esta partida" }
```

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| BET-01 | Realizar aposta | RF07 | Pending |
| BET-02 | Débito imediato | RF07, RF10 | Pending |
| BET-03 | Retorno potencial | RF07 | Pending |
| BET-04 | Validação de saldo | RF07, RF10 | Pending |
| BET-05 | Bloquear partida encerrada | RF07 | Pending |

---

## Success Criteria

- [ ] Apostar com saldo suficiente → saldo atualizado na resposta
- [ ] Apostar sem saldo suficiente → 400, saldo inalterado
- [ ] Retorno potencial correto calculado no frontend antes da confirmação
