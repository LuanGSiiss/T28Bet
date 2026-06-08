# F13 — Lambda Liquidação: Tarefas

## Dependências

```bash
# Na pasta lambda/
npm init -y
npm install @aws-sdk/client-sns mongoose
npm install --save-dev @types/aws-lambda typescript
```

## Tarefas

### T1 — Estrutura do projeto Lambda
**Onde:** `lambda/settlement/`
**O que:** `src/handler.ts`, `tsconfig.json`, `package.json`. Reusar models Mongoose do backend (copiar ou symlink).
**Gate:** `tsc` compila sem erros

### T2 — Função `settleMatch` na Lambda
**Onde:** `lambda/settlement/src/settle.ts`
**O que:** Mesma lógica do `backend/src/services/settlement.ts` mas rodando no contexto Lambda. Idempotente: skip se `status !== "pending"`.
**Gate:** invocar localmente com `{ matchId, winner }` → apostas liquidadas

### T3 — Handler SQS
**Onde:** `lambda/settlement/src/handler.ts`
**O que:** Iterar `event.Records` → parsear `body` → chamar `settleMatch` → publicar SNS
**Gate:** integração com ElasticMQ via SAM local ou invocação direta

### T4 — Publicar no SNS após liquidação
**Onde:** `lambda/settlement/src/handler.ts`
**O que:** `snsClient.publish({ TopicArn, Message: JSON.stringify({ matchId, winner, settled, totalPrizePaid }) })`
**Gate:** log de publicação SNS no output da Lambda
