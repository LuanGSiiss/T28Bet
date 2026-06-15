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

### Infraestrutura local criada (2026-06-15)
- `docker-compose.yml`: MongoDB 7, Redis 7, ElasticMQ (SQS local), LocalStack (SNS local), backend e frontend com profile `app`
- `elasticmq.conf`: filas `t28bet-bets` e `t28bet-settlement` pré-configuradas
- `localstack-init/init-sns.sh`: cria topic `t28bet-results` no startup
- `backend/.env`: todas as variáveis de ambiente para dev local (localhost addresses)
- Todos os pacotes npm instalados no backend e frontend

### Decisão de infra (Terraform-ready)
Todos os endpoints de infra (MongoDB, Redis, SQS, SNS) vêm de variáveis de ambiente.
Os clientes SQS/SNS têm endpoint condicional (`SQS_ENDPOINT` / `SNS_ENDPOINT` vazios = AWS real).
Para migrar para Terraform: apenas atualizar as variáveis de ambiente — código não muda.

### Implementação concluída (2026-06-15)
Todas as features F1–F19 implementadas. TypeScript compila sem erros em backend e frontend.

**Backend (22 arquivos):** modelos, middlewares, rotas, serviços Redis/SQS, WebSocket, workers SQS, seed script
**Frontend (15 arquivos):** AuthContext, páginas (Login, Register, Matches, BetHistory, Transactions, Admin, MatchDetail), componentes (Header, BetModal, DepositModal, PrivateRoute), hooks (useWebSocket)
**Lambda (6 arquivos):** settlement handler + settle.ts + models.ts standalone; notification handler
**Infraestrutura (9 arquivos):** Dockerfiles (backend + frontend), nginx.conf, K8s manifests completos

**Desvios dos specs:**
- Bets route tem fallback síncrono se SQS_BETS_QUEUE_URL não configurado (retorna 201 em vez de 202)
- Admin result route tem fallback síncrono se SQS_SETTLEMENT_QUEUE_URL não configurado
- betsWorker.ts consolida polling de ambas as filas em um único módulo

## Blockers

_nenhum_

## Deferred

- Placar exato (mercado P2) — pós MVP
- OAuth social — fora do escopo
- CloudWatch real — estrutura de log JSON sim, envio cloud depois
- Recuperação de senha — P3
