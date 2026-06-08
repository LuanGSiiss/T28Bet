# F19 — Detalhe da Partida + Histórico de Odds: Especificação

## Problem Statement

Usuários que querem analisar uma partida antes de apostar precisam de mais contexto: todos os mercados disponíveis e como as odds se movimentaram ao longo do tempo.

## Goals

- [ ] Página de detalhe com mercados disponíveis para aquela partida
- [ ] Gráfico ou tabela com histórico de variação das odds

## Out of Scope

| Feature | Reason |
|---|---|
| Odds em tempo real no detalhe | F9 já cobre via WebSocket |
| Estatísticas das equipes | Não exigido |
| Head-to-head histórico | Não exigido |

---

## User Stories

### P2: Página de detalhe da partida

**User Story**: Como usuário, quero acessar a página de uma partida específica para ver todos os mercados e o histórico de odds.

**Acceptance Criteria**:

1. WHEN usuário clica em uma partida THEN frontend SHALL navegar para `/matches/:id`
2. WHEN `GET /api/matches/:id` THEN resposta SHALL incluir `oddsHistory: [{ odds, recordedAt }]` além dos dados da partida
3. WHEN página carrega THEN SHALL exibir tabela com histórico de odds ordenado por `recordedAt` decrescente
4. WHEN partida tem status `finished` THEN SHALL exibir resultado em destaque

**Independent Test**: Atualizar odds 3 vezes → acessar detalhe → tabela mostra 3 registros históricos.

---

## Modelo de Dados — OddsHistory

Cada vez que odds são atualizadas via `PATCH /api/admin/matches/:id/odds`, o sistema registra o snapshot:

```ts
// Embedded no documento Match
oddsHistory: [
  { odds: { home, draw, away }, recordedAt: Date }
]
```

---

## Contratos de API

### `GET /api/matches/:id` (atualizado)
```
200: {
  ...match,
  oddsHistory: [
    { odds: { home, draw, away }, recordedAt: ISODate }
  ]
}
```

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| DETAIL-01 | Página de detalhe | RF06 | Pending |
| DETAIL-02 | Histórico de odds | RF06 | Pending |
| DETAIL-03 | Resultado em destaque | RF06 | Pending |

---

## Success Criteria

- [ ] Navegar para `/matches/:id` → dados e histórico carregam
- [ ] Histórico reflete todas as atualizações de odds feitas via admin
- [ ] Resultado exibido em destaque para partidas encerradas
