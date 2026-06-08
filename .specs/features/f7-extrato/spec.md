# F7 — Extrato de Transações: Especificação

## Problem Statement

O usuário precisa de visibilidade completa sobre as movimentações do seu saldo: depósitos, apostas e prêmios — com data, valor e tipo.

## Goals

- [ ] Extrato completo e cronológico de todas as movimentações do usuário
- [ ] Cada linha identificada com tipo claro (depósito, aposta, prêmio)

## Out of Scope

| Feature | Reason |
|---|---|
| Paginação | MVP — retornar todas as transações |
| Filtro por tipo / data | Não exigido |
| Exportar CSV/PDF | Não exigido |

---

## User Stories

### P2: Listar extrato de transações

**User Story**: Como usuário logado, quero ver todas as movimentações do meu saldo para entender de onde vieram e para onde foram meus créditos.

**Acceptance Criteria**:

1. WHEN `GET /api/wallet/transactions` com token válido THEN sistema SHALL retornar array de transações do usuário ordenadas por `createdAt` decrescente
2. WHEN transação é depósito THEN `type` SHALL ser `"deposit"` e `amount` positivo
3. WHEN transação é aposta THEN `type` SHALL ser `"bet"` e `amount` negativo (débito)
4. WHEN transação é prêmio THEN `type` SHALL ser `"prize"` e `amount` positivo
5. WHEN usuário não tem transações THEN sistema SHALL retornar `[]`

**Independent Test**: Depositar → apostar → ganhar → extrato tem 3 entradas com tipos corretos.

---

## Modelo de Dados

### Transaction (MongoDB)
```ts
{
  userId: ObjectId,
  type: "deposit" | "bet" | "prize",
  amount: number,        // positivo para crédito, negativo para débito
  relatedBetId?: ObjectId,
  description: string,   // ex: "Aposta: Brasil vs Argentina"
  createdAt: Date
}
```

---

## Contratos de API

### `GET /api/wallet/transactions`
```
Header: Authorization: Bearer <token>
200: Transaction[]
[
  { id, type, amount, description, relatedBetId, createdAt }
]
```

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| TX-01 | Listar transações | RF12 | Pending |
| TX-02 | Tipo de transação | RF12 | Pending |
| TX-03 | Transação de depósito | RF11, RF12 | Pending |
| TX-04 | Transação de aposta | RF07, RF12 | Pending |
| TX-05 | Transação de prêmio | RF09, RF12 | Pending |

---

## Success Criteria

- [ ] Extrato reflete todas as movimentações em ordem cronológica
- [ ] Saldo atual = soma de todas as transações (consistência)
