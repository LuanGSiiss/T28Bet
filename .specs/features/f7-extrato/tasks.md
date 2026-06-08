# F7 — Extrato de Transações: Tarefas

## Dependências

Depende de: F3 (Transaction model), F5 (deposit cria Transaction), F6 (prize cria Transaction)

## Tarefas

### T1 — `GET /api/wallet/transactions`
**Onde:** `backend/src/routes/wallet.ts`
**O que:** Buscar transactions do `req.user.id`, ordenar por `createdAt` desc
**Gate:** retorna array com type correto por operação

### T2 — Frontend: página de extrato
**Onde:** `frontend/src/pages/Transactions.tsx`
**O que:** Tabela com colunas: Tipo (badge), Descrição, Valor (verde para crédito, vermelho para débito), Data
**Gate:** extrato visível após depósito + aposta + prêmio
