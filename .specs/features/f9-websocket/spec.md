# F9 — WebSocket Gateway (Odds e Saldo ao Vivo): Especificação

## Problem Statement

Odds e saldo que atualizam via refresh manual degradam a experiência e criam janelas de inconsistência. O sistema precisa propagar mudanças em tempo real para todos os clientes conectados em ≤ 1 segundo.

## Goals

- [ ] Odds atualizadas propagadas a todos os clientes em ≤ 1s (RNF02)
- [ ] Saldo do usuário atualizado em tempo real após aposta ou prêmio
- [ ] Conexão WebSocket re-estabelecida automaticamente em caso de queda

## Out of Scope

| Feature | Reason |
|---|---|
| WebSocket para chat / comentários | Fora do escopo |
| Placar ao vivo (score) | Não exigido para MVP |
| Histórico de eventos via WS | Apenas estado atual |

---

## User Stories

### P1: Odds ao vivo via WebSocket ⭐ MVP

**User Story**: Como usuário na página de partidas, quero que as odds atualizem automaticamente sem recarregar a página.

**Acceptance Criteria**:

1. WHEN cliente conecta ao WebSocket THEN servidor SHALL enviar snapshot atual de todas as odds: `{ type: "odds_snapshot", data: [{ matchId, odds }] }`
2. WHEN admin atualiza odds de uma partida THEN servidor SHALL publicar no Redis Pub/Sub `channel: "odds"` e emitir para todos os clientes conectados: `{ type: "odds_update", data: { matchId, odds } }`
3. WHEN cliente recebe `odds_update` THEN frontend SHALL atualizar a odd exibida sem re-renderizar a lista inteira
4. WHEN conexão WS cai THEN cliente SHALL reconectar com backoff exponencial (1s, 2s, 4s, máx 30s)

**Independent Test**: Abrir dois browsers → atualizar odds no admin → ambas as abas refletem em < 1s.

---

### P1: Saldo ao vivo via WebSocket ⭐ MVP

**User Story**: Como usuário, quero que meu saldo atualize automaticamente após apostar ou receber prêmio, sem precisar recarregar.

**Acceptance Criteria**:

1. WHEN usuário está autenticado e conectado ao WS THEN servidor SHALL enviar mensagem `{ type: "balance_update", data: { balance } }` após qualquer operação que altere o saldo
2. WHEN prêmio é creditado (F6) THEN usuário afetado SHALL receber `balance_update` automaticamente
3. WHEN usuário não está conectado ao WS THEN atualização de saldo SHALL ser refletida no próximo `GET /api/auth/me`

**Independent Test**: Apostar → saldo no header atualiza sem recarregar.

---

## Arquitetura Técnica

```
Admin atualiza odds
       ↓
Backend publica no Redis Pub/Sub (channel: "odds")
       ↓
WS Worker assina Redis e recebe evento
       ↓
WS Worker emite para todos os clientes conectados
```

- **Protocolo**: `ws://` (WebSocket nativo, biblioteca `ws`)
- **Autenticação WS**: token JWT enviado como query param na conexão `ws://host/ws?token=<jwt>`
- **Estrutura de mensagem**: `{ type: string, data: object }`
- **Redis Pub/Sub**: channels `odds`, `balance:<userId>`

---

## Mensagens do Protocolo

| Direção | Type | Payload |
|---|---|---|
| Server → Client | `odds_snapshot` | `{ matches: [{ matchId, odds }] }` |
| Server → Client | `odds_update` | `{ matchId, odds: { home, draw, away } }` |
| Server → Client | `balance_update` | `{ balance: number }` |
| Server → Client | `ping` | `{}` |
| Client → Server | `pong` | `{}` |

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| WS-01 | Odds ao vivo | RF05, RNF02 | Pending |
| WS-02 | Saldo ao vivo | RF10 | Pending |
| WS-03 | Redis Pub/Sub | RNF02 | Pending |
| WS-04 | Reconexão automática | RNF02 | Pending |

---

## Success Criteria

- [ ] Atualizar odds via admin → clientes recebem em < 1s
- [ ] Apostar → saldo atualiza no header sem reload
- [ ] Desconectar WS → reconectar automaticamente
