# F16 — Kubernetes Manifests: Tarefas

## Dependências

Depende de: F15 (Dockerfiles), imagens buildadas

## Tarefas

### T1 — Namespace e ConfigMap/Secret
**Onde:** `k8s/namespace.yaml`, `k8s/configmap.yaml`, `k8s/secret.yaml`
**O que:** Namespace `t28bet`; ConfigMap com `PORT`, `LOG_LEVEL`; Secret com `MONGO_URI`, `JWT_SECRET`, `REDIS_URL` (base64)
**Gate:** `kubectl apply -f k8s/namespace.yaml k8s/configmap.yaml k8s/secret.yaml` sem erros

### T2 — StatefulSet MongoDB + Service
**Onde:** `k8s/mongo/`
**Gate:** `kubectl get pod mongo-0 -n t28bet` → Running

### T3 — Deployment Redis + Service
**Onde:** `k8s/redis/`
**Gate:** `kubectl get pod` → redis Running

### T4 — Deployment Backend + Service
**Onde:** `k8s/backend/deployment.yaml`, `k8s/backend/service.yaml`
**O que:** 2 réplicas, liveness probe `/health`, readiness probe `/ready`, monta ConfigMap e Secret
**Gate:** pods Running, readiness probe passa

### T5 — Deployment Frontend + Service
**Onde:** `k8s/frontend/`
**Gate:** pods Running

### T6 — Ingress
**Onde:** `k8s/ingress.yaml`
**O que:** Host `t28bet.local`. `/api/*` → backend-svc, `/ws` → backend-svc (WebSocket), `/` → frontend-svc
**Gate:** adicionar `t28bet.local` em hosts → curl → resposta do frontend
