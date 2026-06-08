# F17 — HPA (Horizontal Pod Autoscaler): Especificação

## Problem Statement

Durante jogos de alto impacto da Copa, o tráfego pode ser 10x maior do que em períodos normais. O HPA precisa escalar o backend automaticamente com base em carga, e desescalar após o pico.

## Goals

- [ ] Backend escala de 2 para 10 réplicas automaticamente sob carga (RNF04, RNF06)
- [ ] Desescala gradualmente após queda de carga
- [ ] Demonstrável com teste de carga simples

## Out of Scope

| Feature | Reason |
|---|---|
| KEDA (event-driven autoscaling) | HPA padrão é suficiente para demonstração |
| VPA (Vertical Pod Autoscaler) | Não exigido |
| Custom metrics (APM) | CPU/memória são suficientes para MVP |

---

## User Stories

### P1: HPA no backend ⭐ MVP

**User Story**: Como operador, quero que o backend escale automaticamente quando a CPU média ultrapasse 70% para suportar picos de jogos.

**Acceptance Criteria**:

1. WHEN CPU média dos pods de backend ultrapassa 70% THEN HPA SHALL adicionar réplicas (até máx 10)
2. WHEN CPU média cai abaixo de 30% por 5 minutos THEN HPA SHALL reduzir réplicas (mín 2)
3. WHEN HPA cria nova réplica THEN nova réplica SHALL passar por readiness probe antes de receber tráfego
4. WHEN `kubectl get hpa -n t28bet` THEN SHALL exibir métricas atuais de CPU e número de réplicas

**Independent Test**: Executar `kubectl run -it --rm load-test --image=busybox -- sh -c "while true; do wget -q -O- http://backend-svc/api/matches; done"` → observar réplicas aumentarem.

---

## Configuração HPA

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

## Resource Requests/Limits (backend Deployment)

```yaml
resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

---

## Requirement Traceability

| ID | Story | Req Original | Status |
|---|---|---|---|
| HPA-01 | HPA backend | RNF04, RNF06 | Pending |
| HPA-02 | Scale-up sob carga | RNF06 | Pending |
| HPA-03 | Scale-down após pico | RNF04 | Pending |
| HPA-04 | Resource requests definidos | RNF04 | Pending |

---

## Success Criteria

- [ ] `kubectl get hpa` mostra métricas e réplicas
- [ ] Sob carga artificial → réplicas aumentam
- [ ] Carga removida → réplicas reduzem para mínimo em ~5min
