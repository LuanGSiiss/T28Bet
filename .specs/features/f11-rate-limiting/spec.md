# F11 — Rate Limiting: Especificação

## Problem Statement

Endpoints sensíveis (login, apostas) precisam de proteção contra abuso — tentativas de força bruta no login e flood de apostas automatizadas.

## Goals

- [ ] Login: máximo 10 tentativas por IP em 15 minutos
- [ ] Apostas: máximo 10 apostas por usuário por segundo (RNF09)

## Out of Scope

| Feature | Reason |
|---|---|
| Rate limiting global por IP | Não exigido para MVP |
| Blocklist permanente de IP | Não exigido |
| CAPTCHA | Não exigido |

---

## User Stories

### P1: Rate limiting no login ⭐ MVP

**User Story**: Como sistema, quero limitar tentativas de login por IP para prevenir força bruta.

**Acceptance Criteria**:

1. WHEN IP faz > 10 requisições em `POST /api/auth/login` dentro de 15 minutos THEN sistema SHALL retornar `429 Too Many Requests` com header `Retry-After: <segundos>`
2. WHEN IP está no limite THEN mensagem SHALL ser `"Muitas tentativas. Tente novamente em X minutos"`
3. WHEN timer de 15 minutos expira THEN contador SHALL ser zerado e IP liberado

**Independent Test**: 11 chamadas ao login em 1s → 11ª retorna 429.

---

### P1: Rate limiting em apostas ⭐ MVP

**User Story**: Como sistema, quero limitar apostas por usuário para prevenir automação abusiva.

**Acceptance Criteria**:

1. WHEN usuário faz > 10 apostas em 1 segundo THEN sistema SHALL retornar `429` na 11ª
2. WHEN contador reseta (janela deslizante de 1s) THEN usuário pode apostar normalmente

**Independent Test**: 11 apostas em burst → 11ª retorna 429.

---

## Implementação

- **Biblioteca**: `express-rate-limit` + `rate-limit-redis` (store no Redis para funcionar com múltiplas réplicas — RNF04)
- **Configuração login**: `windowMs: 15 * 60 * 1000`, `max: 10`
- **Configuração apostas**: `windowMs: 1000`, `max: 10`, chave por `req.user.id`

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| RATE-01 | Rate limit login | RNF09 | Pending |
| RATE-02 | Rate limit apostas | RNF09 | Pending |
| RATE-03 | Store Redis para multi-réplica | RNF04, RNF09 | Pending |

---

## Success Criteria

- [ ] 11ª tentativa de login retorna 429 com Retry-After
- [ ] 11ª aposta em burst retorna 429
- [ ] Após janela de tempo, contador zerado
