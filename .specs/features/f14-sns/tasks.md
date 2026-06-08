# F14 — SNS Notificações: Tarefas

## Dependências

```bash
npm install @aws-sdk/client-sns  # já instalado na Lambda
```
LocalStack ou SNS local via ElasticMQ para dev.

## Tarefas

### T1 — Configurar SNS local (LocalStack)
**Onde:** `docker-compose.yml`
**O que:** Adicionar serviço LocalStack com SNS habilitado; criar topic `t28bet-results` no startup
**Gate:** `aws --endpoint-url=http://localhost:4566 sns list-topics` → topic listado

### T2 — Lambda de notificação
**Onde:** `lambda/notification/src/handler.ts`
**O que:** Receber evento SNS → parsear mensagem → logar `"[NOTIF] Usuário X: aposta Y resultou em won/lost — Retorno: Z créditos"`
**Gate:** publicar mensagem no topic → log aparece

### T3 — Subscribe Lambda de notificação ao topic
**O que:** Configurar subscription SNS → Lambda de notificação. Em dev: via script ou LocalStack init.
**Gate:** publicar no topic → ambas as Lambdas (liquidação foi a origem; notificação recebe fan-out)
