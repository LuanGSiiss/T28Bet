# F2 — Partidas e Odds: Especificação

## Problem Statement

Usuários precisam ver quais partidas da Copa 2026 estão disponíveis para apostar, com odds atualizadas. Sem essa listagem não há objeto para a aposta.

## Goals

- [ ] Listar todas as partidas com status, data, horário e times
- [ ] Exibir odds 1X2 para cada partida disponível
- [ ] Seed de dados com ao menos 8 partidas reais da fase de grupos

## Out of Scope

| Feature | Reason |
|---|---|
| Histórico de variação de odds | F19 (Fase 5) |
| Mercado de placar exato | Fora do MVP |
| Atualização em tempo real (WebSocket) | F9 (Fase 3) — aqui é REST polling |
| Pesquisa / filtro de partidas | Não exigido |

---

## User Stories

### P1: Listagem de partidas ⭐ MVP

**User Story**: Como usuário logado, quero ver todas as partidas da Copa com status e odds para decidir em qual apostar.

**Why P1**: É o ponto de entrada da jornada de aposta.

**Acceptance Criteria**:

1. WHEN `GET /api/matches` THEN sistema SHALL retornar array de partidas com `{ id, homeTeam, awayTeam, date, status, odds: { home, draw, away } }`
2. WHEN status é `scheduled` THEN campo `odds` SHALL estar presente e aceitar apostas
3. WHEN status é `live` ou `finished` THEN partida SHALL aparecer na lista mas apostas SHALL ser bloqueadas
4. WHEN banco está vazio THEN sistema SHALL rodar seed automático com partidas da fase de grupos

**Independent Test**: `GET /api/matches` retorna >= 8 partidas com odds válidas (odds > 1.0).

---

### P1: Odds por partida ⭐ MVP

**User Story**: Como usuário, quero ver as odds de vitória, empate e derrota de uma partida para calcular meu retorno antes de apostar.

**Acceptance Criteria**:

1. WHEN `GET /api/matches/:id` THEN sistema SHALL retornar partida com odds 1X2 e mercados disponíveis
2. WHEN partida não existe THEN sistema SHALL retornar `404 Not Found`
3. WHEN `status === 'finished'` THEN resposta SHALL incluir `result: { winner }` além das odds

**Independent Test**: `GET /api/matches/:id` com ID válido → odds presentes e `home + draw + away` somam razoavelmente (margem bookmaker ~5%).

---

### P2: Atualizar odds (admin)

**User Story**: Como administrador, quero atualizar as odds de uma partida para refletir o mercado.

**Acceptance Criteria**:

1. WHEN `PATCH /api/admin/matches/:id/odds` com body `{ home, draw, away }` e token admin THEN sistema SHALL persistir novas odds e retornar partida atualizada
2. WHEN odds fora do range `[1.01, 99.99]` THEN sistema SHALL retornar `400`

**Independent Test**: PATCH odds → GET match → odds refletem novo valor.

---

## Edge Cases

- WHEN `date` da partida já passou e status ainda é `scheduled` THEN exibir na lista normalmente (correção de status é responsabilidade do admin)
- WHEN odds com 2 casas decimais THEN sistema SHALL arredondar na exibição (não no banco)
- WHEN `GET /api/matches` sem token THEN sistema SHALL retornar `401`

---

## Modelos de Dados

### Match (MongoDB)
```ts
{
  homeTeam: string,       // "Brasil"
  awayTeam: string,       // "Argentina"
  date: Date,
  status: "scheduled" | "live" | "finished",
  odds: {
    home: number,         // ex: 2.10
    draw: number,         // ex: 3.20
    away: number          // ex: 3.50
  },
  result?: {
    winner: "home" | "draw" | "away"
  }
}
```

---

## Contratos de API

### `GET /api/matches`
```
Header: Authorization: Bearer <token>
200: Match[]
```

### `GET /api/matches/:id`
```
Header: Authorization: Bearer <token>
200: Match
404: { message: "Partida não encontrada" }
```

### `PATCH /api/admin/matches/:id/odds`
```
Header: Authorization: Bearer <token-admin>
Body:   { home: number, draw: number, away: number }
200:    Match atualizado
400:    { errors: [...] }
```

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| MATCH-01 | Listagem | RF04 | Pending |
| MATCH-02 | Odds 1X2 | RF05 | Pending |
| MATCH-03 | Detalhe por ID | RF04 | Pending |
| MATCH-04 | Seed de dados | RF04 | Pending |
| MATCH-05 | Atualizar odds (admin) | RF05 | Pending |

---

## Success Criteria

- [ ] `GET /api/matches` retorna >= 8 partidas com odds
- [ ] Status das partidas exibido corretamente na UI
- [ ] Partida com status `finished` não permite iniciar aposta
