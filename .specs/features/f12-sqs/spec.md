# F12 — SQS: Filas de Apostas e Liquidação: Especificação

## Problem Statement

O processamento síncrono de apostas bloqueia a requisição do usuário e cria ponto único de falha. Com SQS, o backend publica a mensagem e retorna imediatamente; workers consomem de forma assíncrona e resiliente.

## Goals

- [ ] Backend retorna 202 Accepted para aposta sem aguardar persistência final
- [ ] Worker consome fila de apostas e persiste no MongoDB
- [ ] Fila de liquidação desacopla o registro de resultado do processamento dos prêmios

## Out of Scope

| Feature | Reason |
|---|---|
| DLQ (Dead Letter Queue) com alarme | Monitoramento básico é suficiente para MVP |
| FIFO queue | Standard queue com deduplicação manual |
| AWS real obrigatório | ElasticMQ local para dev |

---

## User Stories

### P1: Aposta via SQS ⭐ MVP

**User Story**: Como sistema, quero publicar a aposta no SQS imediatamente após debitar o saldo, para que a persistência final seja assíncrona e não bloqueie o usuário.

**Acceptance Criteria**:

1. WHEN `POST /api/bets` é chamado THEN sistema SHALL debitar saldo (MongoDB síncrono), publicar mensagem na fila `bets-queue` e retornar `202 Accepted` com `{ betId: "pending", estimatedProcessingMs: 500 }`
2. WHEN worker consome mensagem de `bets-queue` THEN worker SHALL criar documento de aposta no MongoDB com status `pending` e publicar confirmação
3. WHEN worker falha ao processar THEN mensagem SHALL voltar para a fila (visibility timeout) para reprocessamento
4. WHEN mensagem processada com sucesso THEN worker SHALL deletar da fila

**Independent Test**: POST aposta → 202 imediato → após ~500ms → `GET /api/bets` lista a aposta.

---

### P1: Liquidação via SQS ⭐ MVP

**User Story**: Como sistema, quando um resultado é registrado, quero publicar evento na fila de liquidação para processamento assíncrono.

**Acceptance Criteria**:

1. WHEN `POST /api/admin/matches/:id/result` THEN sistema SHALL atualizar resultado no MongoDB e publicar `{ matchId, winner }` na fila `settlement-queue`
2. WHEN Lambda/worker consome `settlement-queue` THEN executa liquidação completa (F13)
3. WHEN fila está cheia ou indisponível THEN endpoint admin SHALL retornar `503` e não atualizar o resultado (atomicidade)

**Independent Test**: Registrar resultado → mensagem na fila → Lambda liquida → apostas settled.

---

## Filas

| Fila | Mensagem | Consumer |
|---|---|---|
| `t28bet-bets` | `{ userId, matchId, market, amount, oddsSnapshot }` | Worker Node.js |
| `t28bet-settlement` | `{ matchId, winner }` | Lambda (F13) |

## Configuração Local (ElasticMQ)

```yaml
# docker-compose.yml
elasticmq:
  image: softwaremill/elasticmq-native
  ports:
    - "9324:9324"
  environment:
    - NODE_CONFIG={"queues":{"t28bet-bets":{},"t28bet-settlement":{}}}
```

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| SQS-01 | Publicar aposta na fila | RNF05 | Pending |
| SQS-02 | Worker consome fila de apostas | RNF05 | Pending |
| SQS-03 | Publicar liquidação na fila | RNF05 | Pending |
| SQS-04 | Retry em falha | RNF05 | Pending |

---

## Success Criteria

- [ ] POST aposta → 202 em < 100ms
- [ ] Aposta aparece no histórico após worker processar
- [ ] Desligar worker → mensagem fica na fila → religar → processa
