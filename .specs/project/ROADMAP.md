# Roadmap — T28Bet MVP

## Fase 1 — Core Funcional (MVP Demonstrável)
> Objetivo: usuário cria conta, aposta, vê resultado. Sem infra distribuída ainda.

| Feature | Requisitos | Complexidade |
|---|---|---|
| **F1** Auth (cadastro + login JWT) | RF01, RF02, RNF07, RNF08 | Medium |
| **F2** Partidas e Odds (listagem + seed data) | RF04, RF05 (REST por ora) | Medium |
| **F3** Apostar (débito imediato + persistência) | RF07, RF10 | Medium |
| **F4** Histórico de apostas | RF08 | Small |
| **F5** Saldo + depósito simulado | RF10, RF11 | Small |

**Gate da Fase 1:** fluxo completo funcional end-to-end no navegador.

---

## Fase 2 — Liquidação e Financeiro
> Objetivo: fechar o ciclo da aposta — resultado → prêmio → extrato.

| Feature | Requisitos | Complexidade |
|---|---|---|
| **F6** Liquidação automática (síncrona por ora) | RF09 | Medium |
| **F7** Extrato de transações | RF12 | Small |
| **F8** Admin: registrar resultado de partida | RF09 (trigger) | Small |

**Gate da Fase 2:** apostar → registrar resultado → ver prêmio creditado no extrato.

---

## Fase 3 — Tempo Real e Cache
> Objetivo: WebSocket + Redis para odds ao vivo (RNF02, RNF03).

| Feature | Requisitos | Complexidade |
|---|---|---|
| **F9** WebSocket gateway (odds + saldo ao vivo) | RF05, RF10, RNF02 | Large |
| **F10** Cache Redis para odds e partidas | RNF03 | Medium |
| **F11** Rate limiting (login + apostas) | RNF09 | Small |

**Gate da Fase 3:** abrir duas abas — atualizar odds no backend → ambas refletem em < 1s.

---

## Fase 4 — Infraestrutura Distribuída
> Objetivo: processamento assíncrono via SQS + Lambda.

| Feature | Requisitos | Complexidade |
|---|---|---|
| **F12** SQS: fila de apostas + liquidação | RNF05 | Large |
| **F13** Lambda: liquidação automática | RF09 (Lambda), RNF05 | Large |
| **F14** SNS: notificação de resultado | RF13 | Medium |
| **F15** Docker Compose completo + health checks | RNF12 | Medium |

**Gate da Fase 4:** postar resultado via webhook → Lambda liquida → SNS notifica → saldo atualizado.

---

## Fase 5 — Kubernetes e Observabilidade
> Objetivo: deploy em Kubernetes com HPA e logs estruturados.

| Feature | Requisitos | Complexidade |
|---|---|---|
| **F16** Manifests Kubernetes (Deployment, Service, Ingress) | RNF04 | Large |
| **F17** HPA configurado | RNF04, RNF06 | Medium |
| **F18** Logs estruturados JSON | RNF11 | Small |
| **F19** Página de detalhe da partida + histórico de odds | RF06 | Medium |

**Gate da Fase 5:** `kubectl apply` sobe tudo; HPA reage a carga simulada.

---

## Próxima ação
Começar pela **Fase 1, Feature F1 — Autenticação**.
