# F14 — SNS: Notificações de Resultado: Especificação

## Problem Statement

Após a liquidação, usuários que apostaram precisam ser notificados do resultado e do valor recebido — sem que a Lambda de liquidação precise conhecer os detalhes de cada canal de notificação.

## Goals

- [ ] SNS publica evento de resultado e faz fan-out para múltiplos consumidores
- [ ] Usuário recebe notificação (e-mail simulado no MVP) com resultado e retorno

## Out of Scope

| Feature | Reason |
|---|---|
| Push notification nativa (mobile) | Não há app mobile |
| E-mail real via SES | MVP usa log/console como simulação |
| SMS | Não exigido |
| Notificação de odds mudando | Não exigido (WS já cobre) |

---

## User Stories

### P3: Notificação de resultado de aposta

**User Story**: Como usuário que apostou, quero receber uma notificação informando o resultado e o valor recebido.

**Acceptance Criteria**:

1. WHEN Lambda de liquidação (F13) conclui THEN SHALL publicar no SNS topic `t28bet-results` com `{ matchId, winner, userId, status: "won"|"lost", actualReturn }`
2. WHEN SNS recebe publicação THEN SHALL acionar Lambda de notificação subscrita no topic
3. WHEN Lambda de notificação executa THEN SHALL logar mensagem formatada: `"[NOTIF] Usuário X: sua aposta em Y resultou em Z — Retorno: W créditos"` (simulação de e-mail)
4. WHEN SNS é adicionado novo canal (ex: SES) THEN SHALL ser possível adicionar nova subscription sem alterar a Lambda de liquidação

**Independent Test**: Liquidar aposta → SNS log mostra notificação com resultado correto.

---

## Arquitetura Fan-out

```
Lambda Liquidação
      ↓
  SNS Topic: t28bet-results
      ↓ (subscriptions)
  ├── Lambda Notificação (e-mail simulado)
  └── [futuro] Lambda SES (e-mail real)
```

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| SNS-01 | Publicar resultado no SNS | RF13 | Pending |
| SNS-02 | Lambda de notificação | RF13 | Pending |
| SNS-03 | Fan-out extensível | RF13 | Pending |

---

## Success Criteria

- [ ] Liquidar partida → log de notificação aparece para cada usuário que apostou
- [ ] Adicionar segunda subscription ao SNS sem alterar código da Lambda de liquidação
