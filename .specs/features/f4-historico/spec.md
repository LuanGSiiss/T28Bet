# F4 — Histórico de Apostas: Especificação

## Problem Statement

Após apostar, o usuário precisa acompanhar o status das suas apostas (pendente, ganha, perdida) e ver quanto ganhou ou perdeu ao longo do tempo.

## Goals

- [ ] Listar todas as apostas do usuário com status atualizado
- [ ] Exibir valor apostado, odds, retorno potencial e retorno real

## Out of Scope

| Feature | Reason |
|---|---|
| Paginação | MVP — retornar todas as apostas do usuário |
| Filtros por status / data | Não exigido para MVP |
| Exportar histórico | Não exigido |

---

## User Stories

### P1: Listar apostas do usuário ⭐ MVP

**User Story**: Como usuário logado, quero ver todas as minhas apostas com status para acompanhar meus resultados.

**Why P1**: Sem histórico o usuário não sabe o que apostou nem o que ganhou.

**Acceptance Criteria**:

1. WHEN `GET /api/bets` com token válido THEN sistema SHALL retornar array de apostas do usuário autenticado, ordenadas por `createdAt` decrescente
2. WHEN aposta com `status: "pending"` THEN campo `settledAt` SHALL ser `null`
3. WHEN aposta com `status: "won"` THEN resposta SHALL incluir `actualReturn` (valor creditado)
4. WHEN aposta com `status: "lost"` THEN `actualReturn` SHALL ser `0`
5. WHEN usuário não tem apostas THEN sistema SHALL retornar array vazio `[]`
6. WHEN token inválido THEN sistema SHALL retornar `401`

**Independent Test**: Criar 2 apostas → `GET /api/bets` retorna as 2 na ordem correta.

---

### P1: Detalhe de uma aposta ⭐ MVP

**User Story**: Como usuário, quero ver os detalhes de uma aposta específica, incluindo a partida e o mercado apostado.

**Acceptance Criteria**:

1. WHEN `GET /api/bets/:id` com token válido e aposta pertencente ao usuário THEN sistema SHALL retornar aposta com dados da partida embutidos (`match.homeTeam`, `match.awayTeam`, `match.date`)
2. WHEN aposta pertence a outro usuário THEN sistema SHALL retornar `403 Forbidden`
3. WHEN aposta não existe THEN sistema SHALL retornar `404`

**Independent Test**: GET `/api/bets/:id` retorna `match.homeTeam` populado.

---

## Edge Cases

- WHEN usuário tenta acessar aposta de outro usuário THEN `403` (não `404` — não revelar existência)
- WHEN `id` de aposta é ObjectId inválido THEN `400`

---

## Contratos de API

### `GET /api/bets`
```
Header: Authorization: Bearer <token>
200: Bet[] (com match populado)
[
  {
    id, matchId, match: { homeTeam, awayTeam, date, status },
    market, amount, odds, potentialReturn,
    status: "pending"|"won"|"lost",
    actualReturn, createdAt, settledAt
  }
]
```

### `GET /api/bets/:id`
```
Header: Authorization: Bearer <token>
200:  Bet (com match populado)
403:  { message: "Acesso negado" }
404:  { message: "Aposta não encontrada" }
```

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| HIST-01 | Listar apostas | RF08 | Pending |
| HIST-02 | Status da aposta | RF08 | Pending |
| HIST-03 | Detalhe da aposta | RF08 | Pending |
| HIST-04 | Retorno real exibido | RF08 | Pending |

---

## Success Criteria

- [ ] `GET /api/bets` lista apenas apostas do usuário autenticado
- [ ] Status correto após liquidação (F6)
- [ ] Aposta de outro usuário retorna 403
