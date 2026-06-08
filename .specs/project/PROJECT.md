# T28Bet — MVP Sistema de Apostas Copa do Mundo 2026

**Vision:** Plataforma de apostas esportivas focada na Copa do Mundo 2026, com odds em tempo real, apostas simples e liquidação automática.
**For:** Usuários que acompanham a Copa e querem apostar em resultados de partidas com créditos virtuais.
**Solves:** Demonstrar uma arquitetura distribuída completa (Kubernetes, AWS SQS/SNS, Redis, MongoDB) aplicada a um caso de uso real de alta carga.

## Goals

- Usuário consegue criar conta, apostar em partidas e ver retorno calculado automaticamente
- Sistema propaga atualização de odds em tempo real via WebSocket em ≤ 1 segundo
- Arquitetura suporta escalonamento horizontal (Kubernetes HPA) e processamento assíncrono (SQS)

## Tech Stack

**Core:**
- Framework backend: Express 5 + TypeScript (Node.js)
- Framework frontend: React 18 + TypeScript (CRA)
- Database: MongoDB (apostas, usuários, transações)
- Cache / Pub-Sub: Redis
- Queue: AWS SQS (mock local com ElasticMQ para dev)
- Notificações fan-out: AWS SNS
- Serverless: AWS Lambda (liquidação)
- Orquestração: Kubernetes (Docker Compose para dev local)

**Key dependencies:** jsonwebtoken, bcryptjs, mongoose, ioredis, ws, aws-sdk

## Scope

**v1 includes:**
- Cadastro, login e logout com JWT (24h)
- Listagem de partidas com status e odds 1X2
- Realizar aposta simples com débito imediato de saldo
- Histórico de apostas por usuário
- Liquidação automática ao registrar resultado (via Lambda/SQS)
- Saldo virtual com depósito simulado
- WebSocket para odds e saldo em tempo real
- Health checks `/health` e `/ready`
- Cache de odds via Redis (TTL ~5s)

**Explicitly out of scope:**
| Feature | Reason |
|---|---|
| Gateway de pagamento real | MVP usa créditos simulados |
| Apostas combinadas (múltiplas) | RF não exige |
| Mercado de placar exato (detalhe) | P2 — após MVP estabilizar |
| App mobile nativo | Web responsivo é suficiente |
| Autenticação OAuth/social | JWT próprio atende |
| Logs centralizados (CloudWatch) | Estrutura do log sim, envio cloud depois |

## Constraints

- Timeline: Trabalho acadêmico — entrega incremental por feature
- Technical: Stack já iniciada (Express + CRA); não migrar para NestJS no MVP
- Resources: Dev local com Docker Compose; AWS real opcional na fase de infra
