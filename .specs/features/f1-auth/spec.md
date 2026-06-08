# F1 — Autenticação: Especificação

## Problem Statement

O sistema precisa identificar usuários para associar apostas e saldo a uma conta. Sem autenticação não há histórico, saldo nem aposta rastreável. Esta é a fundação de todas as outras features.

## Goals

- [ ] Usuário consegue criar conta e fazer login em < 30 segundos
- [ ] Token JWT válido por 24h, rejeitado após expirar
- [ ] Senhas nunca armazenadas em texto puro (bcrypt custo 12)

## Out of Scope

| Feature | Reason |
|---|---|
| OAuth / login social | Fora do escopo definido |
| Refresh token | JWT 24h é suficiente para MVP |
| 2FA | Não exigido |
| Recuperação de senha | P3 — pós MVP |

---

## User Stories

### P1: Cadastro de usuário ⭐ MVP

**User Story**: Como visitante, quero criar uma conta com nome, e-mail e senha para poder acessar a plataforma.

**Why P1**: Sem conta não existe contexto de usuário para nenhuma outra feature.

**Acceptance Criteria**:

1. WHEN usuário envia `POST /api/auth/register` com `name`, `email`, `password` válidos THEN sistema SHALL criar usuário no MongoDB, hashear senha com bcrypt (custo 12) e retornar `{ token, user: { id, name, email, balance } }`
2. WHEN e-mail já cadastrado THEN sistema SHALL retornar `409 Conflict` com mensagem `"E-mail já cadastrado"`
3. WHEN `email` inválido ou `password` com menos de 6 caracteres THEN sistema SHALL retornar `400 Bad Request` com campo `errors`
4. WHEN cadastro bem-sucedido THEN saldo inicial SHALL ser `1000` créditos (seed para testes)

**Independent Test**: `POST /api/auth/register` com dados válidos → resposta 201 com token JWT decodificável.

---

### P1: Login ⭐ MVP

**User Story**: Como usuário cadastrado, quero fazer login com e-mail e senha para obter um token de acesso.

**Why P1**: Todas as rotas protegidas dependem do token.

**Acceptance Criteria**:

1. WHEN usuário envia `POST /api/auth/login` com `email` e `password` corretos THEN sistema SHALL retornar `200` com `{ token, user: { id, name, email, balance } }`
2. WHEN senha incorreta ou e-mail não encontrado THEN sistema SHALL retornar `401 Unauthorized` com mensagem genérica `"Credenciais inválidas"` (não revelar qual campo errou)
3. WHEN token JWT incluído no header `Authorization: Bearer <token>` THEN middleware SHALL decodificar e anexar `req.user` à requisição
4. WHEN token expirado ou inválido em rota protegida THEN sistema SHALL retornar `401 Unauthorized`

**Independent Test**: Login com credenciais válidas → token JWT com `exp` 24h à frente.

---

### P1: Logout (cliente) ⭐ MVP

**User Story**: Como usuário logado, quero sair da sessão para que meu token não fique exposto no browser.

**Why P1**: UX mínima exige poder sair.

**Acceptance Criteria**:

1. WHEN usuário clica em "Sair" THEN frontend SHALL remover o token do `localStorage` e redirecionar para `/login`
2. WHEN token removido THEN rotas protegidas do frontend SHALL redirecionar para `/login`

**Independent Test**: Logar → clicar Sair → tentar acessar `/` → redireciona para `/login`.

---

### P1: Rota protegida — perfil do usuário ⭐ MVP

**User Story**: Como usuário logado, quero que o sistema reconheça minha sessão para exibir meu nome e saldo.

**Acceptance Criteria**:

1. WHEN `GET /api/auth/me` com token válido THEN sistema SHALL retornar `{ id, name, email, balance }`
2. WHEN sem token THEN sistema SHALL retornar `401`

**Independent Test**: Token válido em `GET /api/auth/me` → retorna dados do usuário correto.

---

## Edge Cases

- WHEN `name` vazio THEN sistema SHALL retornar `400` com `"Nome é obrigatório"`
- WHEN body JSON malformado THEN sistema SHALL retornar `400 Bad Request`
- WHEN `password` com 5 caracteres THEN sistema SHALL retornar `400` (mínimo 6)
- WHEN mesmo e-mail com capitalização diferente (`User@email.com` vs `user@email.com`) THEN sistema SHALL tratar como duplicado (normalizar para lowercase)

---

## Contratos de API

### `POST /api/auth/register`
```
Body:   { name: string, email: string, password: string }
201:    { token: string, user: { id, name, email, balance } }
400:    { errors: [{ field, message }] }
409:    { message: "E-mail já cadastrado" }
```

### `POST /api/auth/login`
```
Body:   { email: string, password: string }
200:    { token: string, user: { id, name, email, balance } }
401:    { message: "Credenciais inválidas" }
```

### `GET /api/auth/me`
```
Header: Authorization: Bearer <token>
200:    { id, name, email, balance }
401:    { message: "Token inválido ou expirado" }
```

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| AUTH-01 | Cadastro | RF01, RNF08 | Pending |
| AUTH-02 | Login | RF02, RNF07 | Pending |
| AUTH-03 | Logout (cliente) | RF02 | Pending |
| AUTH-04 | Middleware JWT | RNF07 | Pending |
| AUTH-05 | GET /me | RF02 | Pending |

---

## Success Criteria

- [ ] Cadastro → login → GET /me funciona end-to-end no Postman/browser
- [ ] Senha não aparece em nenhum documento do MongoDB
- [ ] Token expirado retorna 401 (testar com `exp` curto)
- [ ] E-mail duplicado retorna 409
