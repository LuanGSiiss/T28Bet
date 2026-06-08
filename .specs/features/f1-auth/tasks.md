# F1 — Auth: Tarefas de Implementação

## Dependências externas necessárias

```bash
# Backend
npm install mongoose jsonwebtoken bcryptjs
npm install --save-dev @types/jsonwebtoken @types/bcryptjs

# Variáveis de ambiente (.env)
MONGO_URI=mongodb://localhost:27017/t28bet
JWT_SECRET=<string-aleatoria-longa>
JWT_EXPIRES_IN=24h
PORT=3001
```

---

## Tarefas

### T1 — Docker Compose com MongoDB
**O que:** `docker-compose.yml` na raiz com serviço MongoDB 7.
**Onde:** `/docker-compose.yml`
**Done when:** `docker compose up -d` sobe MongoDB acessível em `localhost:27017`
**Gate:** `docker ps` mostra container rodando

---

### T2 — Conexão MongoDB + modelo User
**O que:** Conectar Mongoose no `index.ts`; criar `src/models/User.ts` com schema.
**Onde:** `backend/src/models/User.ts`, `backend/src/index.ts`
**Schema:**
```ts
{ name: string, email: string (unique, lowercase), password: string (hash), balance: number (default 1000), createdAt }
```
**Done when:** `npm run dev` conecta ao Mongo sem erro; modelo exportado.
**Gate:** log "MongoDB conectado" no console

---

### T3 — Middleware JWT (`authMiddleware`)
**O que:** `src/middlewares/auth.ts` — valida `Authorization: Bearer <token>`, anexa `req.user`.
**Onde:** `backend/src/middlewares/auth.ts`
**Done when:** Requisição com token válido passa; token ausente/expirado → `401`
**Gate:** Teste manual com curl/Postman

---

### T4 — `POST /api/auth/register`
**O que:** Validação de body → hash bcrypt → salvar User → gerar JWT → retornar `{ token, user }`.
**Onde:** `backend/src/routes/auth.ts`
**Done when:** AUTH-01 satisfeito (ver spec)
**Gate:** 201 com token; 409 em e-mail duplicado; 400 em password curta

---

### T5 — `POST /api/auth/login`
**O que:** Buscar user por email → comparar bcrypt → gerar JWT → retornar `{ token, user }`.
**Onde:** `backend/src/routes/auth.ts`
**Done when:** AUTH-02 satisfeito
**Gate:** 200 com token válido; 401 com mensagem genérica em credencial errada

---

### T6 — `GET /api/auth/me`
**O que:** Rota protegida pelo `authMiddleware` que retorna dados do usuário logado.
**Onde:** `backend/src/routes/auth.ts`
**Done when:** AUTH-04, AUTH-05 satisfeitos
**Gate:** 200 com dados; 401 sem token

---

### T7 — Frontend: páginas Login e Cadastro
**O que:** Duas páginas com formulário (`/login`, `/register`). Chamar API, salvar token no `localStorage`, redirecionar para `/`.
**Onde:** `frontend/src/pages/Login.tsx`, `frontend/src/pages/Register.tsx`
**Done when:** AUTH-02, AUTH-01 funcionam no browser
**Gate:** Login bem-sucedido redireciona para home; erro exibe mensagem

---

### T8 — Frontend: AuthContext + PrivateRoute
**O que:** Context que expõe `{ user, token, login, logout }`. `PrivateRoute` redireciona para `/login` se não autenticado.
**Onde:** `frontend/src/contexts/AuthContext.tsx`, `frontend/src/components/PrivateRoute.tsx`
**Done when:** AUTH-03 satisfeito (logout limpa localStorage e redireciona)
**Gate:** Logout → rota `/` → redireciona para `/login`

---

### T9 — Frontend: header com nome e saldo
**O que:** Componente `Header` exibe nome do usuário e saldo (dados do `AuthContext`).
**Onde:** `frontend/src/components/Header.tsx`
**Done when:** Saldo e nome visíveis após login
**Gate:** Visual no browser

---

## Ordem de execução

```
T1 → T2 → T3 → T4 → T5 → T6  (backend, sequencial)
                              → T7 → T8 → T9  (frontend, após T4-T6)
```

## Commit sugerido por task

Cada task = 1 commit atômico:
- `feat: add MongoDB docker-compose`
- `feat: add User model with mongoose`
- `feat: add JWT auth middleware`
- `feat: add POST /api/auth/register`
- `feat: add POST /api/auth/login`
- `feat: add GET /api/auth/me`
- `feat: add Login and Register pages`
- `feat: add AuthContext and PrivateRoute`
- `feat: add Header with user name and balance`
