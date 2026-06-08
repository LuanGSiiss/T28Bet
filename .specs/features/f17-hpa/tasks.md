# F17 — HPA: Tarefas

## Dependências

Depende de: F16 (Deployment backend com resource requests)
Requer Metrics Server no cluster (`kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml`)

## Tarefas

### T1 — Resource requests no Deployment do backend
**Onde:** `k8s/backend/deployment.yaml`
**O que:** Adicionar `resources.requests.cpu: 100m` e `resources.limits.cpu: 500m`
**Gate:** `kubectl describe pod <backend>` → Resources configurados

### T2 — Manifest HPA
**Onde:** `k8s/backend/hpa.yaml`
**O que:** `minReplicas: 2`, `maxReplicas: 10`, `targetCPUUtilizationPercentage: 70`
**Gate:** `kubectl get hpa -n t28bet` → exibe métricas

### T3 — Teste de carga manual
**O que:** `kubectl run load-test --image=busybox --rm -it -- sh -c "while true; do wget -qO- http://backend-svc.t28bet/health; done"` → observar `kubectl get hpa -w`
**Gate:** réplicas aumentam sob carga; reduzem após parar o load test
