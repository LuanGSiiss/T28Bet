# F8 — Painel Admin: Registrar Resultado: Especificação

## Problem Statement

Para acionar a liquidação automática (F6), um operador precisa de uma interface para registrar o resultado de uma partida e atualizar odds sem acessar o banco diretamente.

## Goals

- [ ] Interface simples para selecionar partida e registrar resultado
- [ ] Capacidade de atualizar odds de partidas scheduled

## Out of Scope

| Feature | Reason |
|---|---|
| Controle de acesso por papel (RBAC) completo | MVP usa flag `isAdmin` no JWT |
| Criar / deletar partidas pela UI | Seed de dados é suficiente para MVP |
| Auditoria de ações admin | Não exigido para MVP |

---

## User Stories

### P1: Registrar resultado de partida ⭐ MVP

**User Story**: Como administrador, quero registrar o resultado de uma partida para acionar a liquidação automática das apostas.

**Acceptance Criteria**:

1. WHEN admin acessa `/admin` THEN frontend SHALL exibir lista de partidas com status `scheduled` ou `live`
2. WHEN admin seleciona partida e escolhe o vencedor (`casa / empate / fora`) e clica em "Confirmar resultado" THEN sistema SHALL chamar `POST /api/admin/matches/:id/result` e exibir resumo da liquidação (`X apostas liquidadas, total pago: Y créditos`)
3. WHEN partida já tem resultado THEN botão SHALL estar desabilitado
4. WHEN chamada retorna erro THEN frontend SHALL exibir mensagem de erro clara

**Independent Test**: Admin registra resultado → mensagem de sucesso com apostas liquidadas.

---

### P2: Atualizar odds de partida

**User Story**: Como administrador, quero ajustar as odds de uma partida scheduled para refletir o mercado.

**Acceptance Criteria**:

1. WHEN admin acessa `/admin` e clica em "Editar odds" de uma partida THEN frontend SHALL exibir formulário com odds atuais editáveis
2. WHEN admin salva THEN sistema SHALL chamar `PATCH /api/admin/matches/:id/odds` e exibir confirmação

**Independent Test**: Editar odds → GET match → odds atualizadas.

---

## Autenticação Admin

- Token JWT com campo `isAdmin: true`
- Seed cria usuário `admin@t28bet.com / admin123` com `isAdmin: true`
- Middleware `requireAdmin` verifica `req.user.isAdmin === true`

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| ADMIN-01 | Registrar resultado | RF09 | Pending |
| ADMIN-02 | Listar partidas no painel | RF04 | Pending |
| ADMIN-03 | Atualizar odds | RF05 | Pending |
| ADMIN-04 | Middleware admin | RNF07 | Pending |

---

## Success Criteria

- [ ] Admin registra resultado → F6 é acionada → apostas liquidadas
- [ ] Usuário comum não consegue acessar `/api/admin/*` (403)
- [ ] Painel exibe apenas partidas que ainda aceitam resultado
