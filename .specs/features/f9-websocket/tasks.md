# F9 — WebSocket Gateway: Tarefas

## Dependências

```bash
npm install ws ioredis
npm install --save-dev @types/ws
```
Depende de: F1 (JWT), F2 (odds), F5 (balance), F10 (Redis)

## Tarefas

### T1 — Redis Pub/Sub setup
**Onde:** `backend/src/services/redis.ts`
**O que:** Exportar cliente Redis e subscriber separados (ioredis não permite usar mesmo cliente para pub e sub)
**Gate:** `redisSub.subscribe("odds", "balance:*")` sem erro

### T2 — Servidor WebSocket
**Onde:** `backend/src/ws/server.ts`
**O que:** Criar servidor `ws.Server`, autenticar token JWT do query param, enviar `odds_snapshot` na conexão, receber pings
**Gate:** conectar com `wscat -c "ws://localhost:3001/ws?token=<jwt>"` → receber odds_snapshot

### T3 — Publicar odds update no Redis
**Onde:** `backend/src/routes/admin.ts` (no PATCH de odds)
**O que:** Após salvar odds, `redisClient.publish("odds", JSON.stringify({ matchId, odds }))`
**Gate:** atualizar odds via API → evento chega no subscriber

### T4 — WS relay: odds update para clientes
**Onde:** `backend/src/ws/server.ts`
**O que:** Redis subscriber escuta `"odds"` → emite `{ type: "odds_update", data }` para todos os clientes conectados
**Gate:** 2 clientes WS conectados → PATCH odds → ambos recebem mensagem

### T5 — Publicar balance update no Redis
**Onde:** `backend/src/services/settlement.ts` + `backend/src/routes/bets.ts`
**O que:** Após débito de aposta ou crédito de prêmio → `redisClient.publish("balance:<userId>", JSON.stringify({ balance }))`
**Gate:** apostar → cliente WS do usuário recebe balance_update

### T6 — Frontend: hook useWebSocket
**Onde:** `frontend/src/hooks/useWebSocket.ts`
**O que:** Conectar ao WS com token, lidar com mensagens, reconexão automática com backoff
**Gate:** reconectar após queda

### T7 — Frontend: atualizar odds e saldo via WS
**Onde:** `frontend/src/pages/Matches.tsx`, `frontend/src/contexts/AuthContext.tsx`
**O que:** Ouvir `odds_update` → atualizar odds na lista; ouvir `balance_update` → atualizar saldo no contexto
**Gate:** atualizar odds no admin → odds mudam no browser sem reload

## Ordem

T1 → T2 → T3 → T4 → T5 (backend) → T6 → T7 (frontend)
