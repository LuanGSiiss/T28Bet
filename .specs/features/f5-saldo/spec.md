# F5 — Saldo e Depósito Simulado: Especificação

## Problem Statement

O usuário precisa ver seu saldo em destaque e ter uma forma de adicionar créditos quando o saldo zerar, sem gateway de pagamento real.

## Goals

- [ ] Saldo visível em destaque em todas as páginas autenticadas
- [ ] Usuário consegue adicionar créditos via simulação

## Out of Scope

| Feature | Reason |
|---|---|
| Gateway de pagamento real | MVP usa simulação conforme RF11 |
| Saque / retirada | Não exigido |
| Múltiplas moedas | Créditos virtuais apenas |
| Saldo em tempo real via WebSocket | F9 (Fase 3) |

---

## User Stories

### P1: Visualizar saldo ⭐ MVP

**User Story**: Como usuário logado, quero ver meu saldo de créditos em destaque na interface para saber quanto posso apostar.

**Acceptance Criteria**:

1. WHEN usuário está autenticado THEN saldo SHALL estar visível no Header em todas as páginas protegidas
2. WHEN aposta é realizada THEN saldo exibido SHALL refletir o débito imediatamente (via resposta da API de aposta)
3. WHEN prêmio é creditado (F6) THEN saldo SHALL ser atualizado

**Independent Test**: Login → ver saldo 1000 no header → realizar aposta de 100 → saldo exibe 900.

---

### P2: Depositar créditos (simulado)

**User Story**: Como usuário, quero adicionar créditos à minha conta para continuar apostando quando meu saldo estiver baixo.

**Acceptance Criteria**:

1. WHEN `POST /api/wallet/deposit` com `{ amount }` e token válido THEN sistema SHALL adicionar `amount` ao saldo do usuário e retornar `{ balance: novoSaldo }`
2. WHEN `amount < 10` THEN sistema SHALL retornar `400` com `"Depósito mínimo é 10 créditos"`
3. WHEN `amount > 10000` THEN sistema SHALL retornar `400` com `"Depósito máximo é 10.000 créditos por transação"`
4. WHEN depósito bem-sucedido THEN sistema SHALL criar registro na coleção de transações com `type: "deposit"`

**Independent Test**: POST deposit 500 → GET /api/auth/me → balance aumentou 500.

---

## Edge Cases

- WHEN `amount` é negativo THEN `400`
- WHEN `amount` é zero THEN `400`
- WHEN dois depósitos simultâneos THEN MongoDB SHALL garantir soma correta (operação atômica `$inc`)

---

## Contratos de API

### `POST /api/wallet/deposit`
```
Header: Authorization: Bearer <token>
Body:   { amount: number }
200:    { balance: number, transaction: { id, type: "deposit", amount, createdAt } }
400:    { message: "..." }
```

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| WALLET-01 | Exibir saldo | RF10 | Pending |
| WALLET-02 | Depósito simulado | RF11 | Pending |
| WALLET-03 | Transação registrada | RF11, RF12 | Pending |

---

## Success Criteria

- [ ] Saldo visível no Header após login
- [ ] Depósito aumenta saldo e registra transação
- [ ] Saldo reflete débito de aposta sem recarregar página
