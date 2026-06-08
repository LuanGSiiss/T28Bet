# F13 — Lambda: Liquidação Automática: Especificação

## Problem Statement

A liquidação de apostas é uma operação em batch que pode ser demorada se houver muitas apostas. Rodar como Lambda garante isolamento, escalabilidade e não consome recursos do backend principal.

## Goals

- [ ] Lambda consume `t28bet-settlement` queue e liquida todas as apostas da partida
- [ ] Executa em < 30s para até 10.000 apostas (timeout Lambda padrão)
- [ ] Idempotente: rodar a Lambda duas vezes para o mesmo resultado não duplica créditos

## Out of Scope

| Feature | Reason |
|---|---|
| Lambda para apostas individuais | Worker Node.js é suficiente (F12) |
| Lambda aquecida (provisioned concurrency) | Não necessário para MVP |
| Rollback de liquidação | Não exigido |

---

## User Stories

### P1: Lambda liquida apostas da partida ⭐ MVP

**User Story**: Como sistema, quero que a Lambda processe a fila de liquidação e distribua os prêmios automaticamente.

**Acceptance Criteria**:

1. WHEN Lambda recebe mensagem `{ matchId, winner }` de `t28bet-settlement` THEN Lambda SHALL buscar todas as apostas `{ matchId, status: "pending" }` no MongoDB
2. WHEN aposta tem `market === winner` THEN Lambda SHALL atualizar `status = "won"`, calcular `actualReturn`, creditar saldo com `$inc` atômico e criar transação `prize`
3. WHEN aposta tem `market !== winner` THEN Lambda SHALL atualizar `status = "lost"`, `actualReturn = 0`
4. WHEN aposta já tem `status !== "pending"` THEN Lambda SHALL pular (idempotência)
5. WHEN Lambda conclui THEN SHALL publicar no SNS `{ matchId, winner, settled, totalPrizePaid }` (F14)
6. WHEN Lambda falha THEN mensagem volta para `t28bet-settlement` para retry automático

**Independent Test**: Registrar resultado → Lambda executa → apostas settled no MongoDB.

---

## Implementação

- **Runtime**: Node.js 20 (AWS Lambda)
- **Trigger**: SQS (`t28bet-settlement`)
- **Conexão MongoDB**: reutilizar conexão entre invocações (fora do handler)
- **Variáveis de ambiente**: `MONGO_URI`, `SNS_TOPIC_ARN`, `AWS_REGION`
- **Local dev**: Lambda local via `aws-lambda-ric` ou SAM CLI

```ts
// handler.ts
export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const { matchId, winner } = JSON.parse(record.body);
    await settleMatch(matchId, winner);
  }
};
```

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| LAMBDA-01 | Consume settlement queue | RF09, RNF05 | Pending |
| LAMBDA-02 | Liquida apostas ganhadoras | RF09 | Pending |
| LAMBDA-03 | Idempotência | RF09 | Pending |
| LAMBDA-04 | Publica no SNS | RF13 | Pending |

---

## Success Criteria

- [ ] Lambda executa após mensagem na fila → apostas liquidadas
- [ ] Segunda execução com mesmo matchId → sem duplicação de créditos
- [ ] Timeout de 30s com 10k apostas não é atingido
