# F8 — Painel Admin: Tarefas

## Dependências

Depende de: F1 (auth/admin), F2 (Match), F6 (settleMatch)

## Tarefas

### T1 — Frontend: rota /admin com PrivateRoute admin
**Onde:** `frontend/src/pages/Admin.tsx`, roteamento em `App.tsx`
**O que:** Rota `/admin` acessível apenas se `user.isAdmin === true`
**Gate:** usuário comum redirecionado; admin vê painel

### T2 — Frontend: listagem de partidas no painel
**Onde:** `frontend/src/pages/Admin.tsx`
**O que:** GET /api/matches → listar partidas com status. Para partidas sem resultado: botão "Registrar Resultado" com select (Casa / Empate / Fora). Para partidas encerradas: exibir resultado.
**Gate:** admin vê botão; partida encerrada não tem botão

### T3 — Frontend: registrar resultado
**O que:** Chamar `POST /api/admin/matches/:id/result` → exibir toast com `"X apostas liquidadas, Y créditos distribuídos"`
**Gate:** ação liquida apostas e exibe confirmação

### T4 — Frontend: editar odds
**O que:** Formulário inline para editar odds → chamar PATCH → exibir confirmação
**Gate:** odds atualizadas refletem na listagem

## Ordem

T1 → T2 → T3 → T4
