# F12 — SQS: Tarefas

## Dependências

```bash
npm install @aws-sdk/client-sqs
```
ElasticMQ adicionado no docker-compose.yml (F15)

## Tarefas

### T1 — Cliente SQS
**Onde:** `backend/src/services/sqs.ts`
**O que:** Exportar `sqsClient` com endpoint apontando para ElasticMQ em dev ou AWS em prod (via env `SQS_ENDPOINT`)

### T2 — Publicar aposta na fila `t28bet-bets`
**Onde:** `backend/src/routes/bets.ts`
**O que:** Após debitar saldo (síncrono), publicar `{ userId, matchId, market, amount, oddsSnapshot }` → retornar `202 Accepted`

### T3 — Worker de apostas
**Onde:** `backend/src/workers/betsWorker.ts`
**O que:** Long polling em `t28bet-bets`, criar documento Bet no MongoDB, deletar mensagem após sucesso
**Gate:** POST aposta → worker loga processamento → aposta aparece no GET /api/bets

### T4 — Modificar `POST /api/admin/matches/:id/result`
**Onde:** `backend/src/routes/admin.ts`
**O que:** Substituir chamada síncrona a `settleMatch` por publish em `t28bet-settlement`
**Gate:** registrar resultado → mensagem na fila → Lambda/worker consome

### T5 — ElasticMQ no docker-compose.yml
**Onde:** `docker-compose.yml`
**O que:** Adicionar serviço `elasticmq` com as duas filas configuradas
**Gate:** `docker compose up` → filas acessíveis em `localhost:9324`
