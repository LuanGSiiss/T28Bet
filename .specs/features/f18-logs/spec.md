# F18 — Logs Estruturados JSON: Especificação

## Problem Statement

Logs em texto livre são impossíveis de filtrar e agregar em produção. Logs JSON estruturados permitem busca por campo, correlação de requisições e integração com CloudWatch/ELK.

## Goals

- [ ] Todos os logs emitidos em JSON (RNF11)
- [ ] Cada requisição logada com `requestId`, método, path, statusCode e duração
- [ ] Erros logados com stack trace e contexto

## Out of Scope

| Feature | Reason |
|---|---|
| Envio para CloudWatch real | Estrutura do log sim, envio cloud é opcional |
| Distributed tracing (Jaeger/OTEL) | Não exigido para MVP |
| Log rotation | Docker/Kubernetes cuidam disso |

---

## User Stories

### P2: Logs estruturados no backend

**User Story**: Como operador, quero que todos os logs do backend sejam JSON para facilitar busca e monitoramento.

**Acceptance Criteria**:

1. WHEN qualquer requisição HTTP é processada THEN backend SHALL emitir log JSON: `{ timestamp, level, requestId, method, path, statusCode, durationMs, userId? }`
2. WHEN erro não tratado ocorre THEN backend SHALL emitir log com `level: "error"`, `message`, `stack`, `requestId`
3. WHEN serviço inicia THEN SHALL emitir log `{ level: "info", message: "Service started", port, env }`
4. WHEN worker SQS processa mensagem THEN SHALL logar `{ level: "info", queueName, messageId, action, durationMs }`

**Independent Test**: `docker compose logs backend | head -20` → todas as linhas são JSON válido.

---

## Implementação

- **Biblioteca**: `pino` (logger JSON de alta performance para Node.js)
- **Middleware HTTP**: `pino-http` para request logging automático
- **requestId**: gerado por `crypto.randomUUID()` ou header `X-Request-ID` passado pelo cliente

```ts
// logger.ts
import pino from 'pino';
export const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
```

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| LOG-01 | Logs JSON estruturados | RNF11 | Pending |
| LOG-02 | Request logging com requestId | RNF11 | Pending |
| LOG-03 | Error logging com stack | RNF11 | Pending |
| LOG-04 | Worker SQS logging | RNF11 | Pending |

---

## Success Criteria

- [ ] `docker compose logs backend` → JSON válido em todas as linhas
- [ ] Conseguir filtrar por `statusCode: 500` com `jq`
- [ ] requestId presente em todos os logs de uma requisição
