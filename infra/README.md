# Terraform AWS Lab - EKS + RDS PostgreSQL + DynamoDB + SQS + SNS + CloudWatch

Infraestrutura genérica para laboratório AWS.

## Recursos provisionados

- VPC customizada
- Subnets públicas e privadas
- Internet Gateway
- NAT Gateway opcional
- EKS Cluster
- EKS Managed Node Group com mínimo de 3 instâncias
- AWS Load Balancer Controller via Helm
- RDS PostgreSQL privado
- DynamoDB
- SQS
- SNS com subscription para SQS
- CloudWatch Log Groups
- CloudWatch Alarms básicos

## Pré-requisitos

No terminal:

```bash
aws sts get-caller-identity
terraform -version
kubectl version --client
helm version
```

## Como usar

Copie o exemplo de variáveis:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edite a senha do RDS no arquivo `terraform.tfvars`.

Inicialize:

```bash
terraform init
```

Valide:

```bash
terraform validate
```

Planeje:

```bash
terraform plan
```

Aplique:

```bash
terraform apply
```

Configure o kubectl:

```bash
aws eks update-kubeconfig --region us-east-1 --name lab-eks-app
```

Valide o cluster:

```bash
kubectl get nodes
kubectl get pods -A
kubectl -n kube-system get deploy aws-load-balancer-controller
```

## Exemplo de Load Balancer público

Depois que o Terraform terminar:

```bash
kubectl apply -f k8s/example-public-alb.yaml
kubectl get ingress -n lab-app
```

## Exemplo de Load Balancer interno

```bash
kubectl apply -f k8s/example-internal-nlb.yaml
kubectl get svc -n lab-app
```

## Destruir tudo

```bash
kubectl delete -f k8s/example-public-alb.yaml --ignore-not-found
kubectl delete -f k8s/example-internal-nlb.yaml --ignore-not-found
terraform destroy
```

## Observações importantes para laboratório

- `enable_nat_gateway = true` facilita o funcionamento dos nodes privados, mas NAT Gateway gera custo.
- O RDS fica privado e aceita conexão apenas do security group do cluster EKS.
- A política IAM do AWS Load Balancer Controller está simplificada para laboratório. Em produção, substitua por política mais restritiva.
- O add-on `amazon-cloudwatch-observability` está desligado por padrão porque pode exigir permissões adicionais em labs. Para tentar habilitar, use:

```hcl
enable_cloudwatch_observability_addon = true
```
