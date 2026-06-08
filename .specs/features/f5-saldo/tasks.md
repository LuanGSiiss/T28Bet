# F5 — Saldo e Depósito Simulado: Tarefas

## Dependências

Depende de: F1 (User model, AuthContext), F3 (Transaction model)

## Tarefas

### T1 — `POST /api/wallet/deposit`
**Onde:** `backend/src/routes/wallet.ts`
**O que:** Validar amount (10–10000) → `User.findByIdAndUpdate($inc balance)` → criar Transaction `"deposit"` → retornar `{ balance, transaction }`
**Gate:** 200 com novo saldo; 400 em amount inválido

### T2 — Frontend: modal de depósito
**Onde:** `frontend/src/components/DepositModal.tsx`
**O que:** Modal com campo de valor e botão confirmar. Exibe novo saldo após sucesso.
**Gate:** depósito atualiza saldo no header

### T3 — Frontend: botão de depósito no Header
**Onde:** `frontend/src/components/Header.tsx`
**O que:** Botão "+ Créditos" abre DepositModal
**Gate:** clique abre modal; após depósito, saldo atualiza

## Ordem

T1 (backend) → T2 → T3 (frontend)
