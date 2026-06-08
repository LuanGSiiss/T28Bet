# F16 — Kubernetes Manifests: Especificação

## Problem Statement

Para demonstrar arquitetura de produção, o sistema precisa de manifests Kubernetes que orquestrem todos os serviços com configuração segura e roteamento externo.

## Goals

- [ ] `kubectl apply -f k8s/` sobe todos os serviços no cluster
- [ ] Secrets e configurações via ConfigMap/Secret (não hardcoded)
- [ ] Ingress roteando tráfego externo para frontend e backend

## Out of Scope

| Feature | Reason |
|---|---|
| Helm chart | Manifests YAML são suficientes para demonstração acadêmica |
| Multi-cluster | Single cluster para MVP |
| Persistent volumes para produção | StatefulSet com PVC básico |
| TLS/HTTPS via cert-manager | Opcional — fora do escopo obrigatório |

---

## User Stories

### P1: Deployments para backend e frontend ⭐ MVP

**User Story**: Como operador, quero aplicar manifests Kubernetes para subir o sistema em um cluster.

**Acceptance Criteria**:

1. WHEN `kubectl apply -f k8s/` THEN todos os Deployments SHALL criar Pods no namespace `t28bet`
2. WHEN Pod de backend inicia THEN SHALL montar ConfigMap com variáveis de ambiente e Secret com `MONGO_URI` e `JWT_SECRET`
3. WHEN Pod falha liveness probe (`GET /health` → não-200) THEN Kubernetes SHALL reiniciar o Pod
4. WHEN Pod falha readiness probe (`GET /ready` → não-200) THEN Kubernetes SHALL remover Pod do Service endpoint (sem tráfego)

**Independent Test**: `kubectl get pods -n t28bet` → todos Running; `kubectl describe pod <backend>` → liveness e readiness configurados.

---

### P1: Services e Ingress ⭐ MVP

**User Story**: Como operador, quero que o tráfego externo seja roteado corretamente para frontend e backend.

**Acceptance Criteria**:

1. WHEN Ingress aplicado com host `t28bet.local` THEN `http://t28bet.local/` SHALL rotear para frontend
2. WHEN `http://t28bet.local/api/*` THEN Ingress SHALL rotear para backend Service
3. WHEN `http://t28bet.local/ws` THEN Ingress SHALL rotear para backend com suporte a WebSocket (anotação `nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"`)

**Independent Test**: Adicionar `t28bet.local` em `/etc/hosts` → acessar no browser → frontend carrega.

---

## Estrutura de arquivos

```
k8s/
├── namespace.yaml
├── configmap.yaml
├── secret.yaml          # base64-encoded, NÃO commitar valores reais
├── backend/
│   ├── deployment.yaml
│   └── service.yaml
├── frontend/
│   ├── deployment.yaml
│   └── service.yaml
├── mongo/
│   ├── statefulset.yaml
│   └── service.yaml
├── redis/
│   ├── deployment.yaml
│   └── service.yaml
└── ingress.yaml
```

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| K8S-01 | Deployments backend/frontend | RNF04 | Pending |
| K8S-02 | ConfigMap e Secret | RNF04 | Pending |
| K8S-03 | Liveness e Readiness probes | RNF12 | Pending |
| K8S-04 | Service e Ingress | RNF04 | Pending |

---

## Success Criteria

- [ ] `kubectl apply -f k8s/` → todos os pods Running
- [ ] Liveness probe reinicia pod com falha
- [ ] Readiness probe remove pod indisponível do balanceador
- [ ] Ingress roteia `/api/*` para backend e `/` para frontend
