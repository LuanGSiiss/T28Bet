# STATE — T28Bet

## Decisões

- **Stack backend mantida em Express** (não NestJS): projeto já iniciado com Express, troca seria overhead sem ganho para MVP acadêmico.
- **Frontend mantido em CRA (React)**: não migrar para Next.js.
- **ElasticMQ local** para simular SQS em dev (Fase 4), AWS real é opcional.
- **Liquidação da Fase 2** será síncrona (sem SQS/Lambda); Fase 4 migra para assíncrona.
- **MongoDB local** via Docker Compose desde a Fase 1.

## Progresso

### Fase 1 — Core Funcional
- [x] F1 — Auth (spec + tasks)
- [x] F2 — Partidas e Odds (spec + tasks)
- [x] F3 — Apostar (spec + tasks)
- [x] F4 — Histórico de apostas (spec + tasks)
- [x] F5 — Saldo e depósito simulado (spec + tasks)

### Fase 2 — Liquidação e Financeiro
- [x] F6 — Liquidação automática (spec + tasks)
- [x] F7 — Extrato de transações (spec + tasks)
- [x] F8 — Painel admin (spec + tasks)

### Fase 3 — Tempo Real e Cache
- [x] F9 — WebSocket gateway (spec + tasks)
- [x] F10 — Cache Redis (spec + tasks)
- [x] F11 — Rate limiting (spec + tasks)

### Fase 4 — Infraestrutura Distribuída
- [x] F12 — SQS filas (spec + tasks)
- [x] F13 — Lambda liquidação (spec + tasks)
- [x] F14 — SNS notificações (spec + tasks)
- [x] F15 — Docker Compose + health checks (spec + tasks)

### Fase 5 — Kubernetes e Observabilidade
- [x] F16 — Kubernetes manifests (spec + tasks)
- [x] F17 — HPA (spec + tasks)
- [x] F18 — Logs estruturados (spec + tasks)
- [x] F19 — Detalhe da partida (spec + tasks)

## Implementação

Nenhuma feature implementada ainda. Pronto para iniciar pela Fase 1, F1.

## Blockers

_nenhum_

## Deferred

- Placar exato (mercado P2) — pós MVP
- OAuth social — fora do escopo
- CloudWatch real — estrutura de log JSON sim, envio cloud depois
- Recuperação de senha — P3
