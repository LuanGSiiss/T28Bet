variable "project_name" {
  description = "Nome base usado nos recursos."
  type        = string
  default     = "lab-eks-app"
}

variable "aws_region" {
  description = "Região AWS."
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR da VPC."
  type        = string
  default     = "10.40.0.0/16"
}

variable "availability_zones_count" {
  description = "Quantidade de AZs usadas. Recomendo 2 ou 3 no laboratório."
  type        = number
  default     = 3
}

variable "enable_nat_gateway" {
  description = "Cria NAT Gateway para nodes privados acessarem internet/ECR. Pode gerar custo."
  type        = bool
  default     = true
}

variable "eks_version" {
  description = "Versão do Kubernetes no EKS."
  type        = string
  default     = "1.30"
}

variable "node_instance_types" {
  description = "Tipos de instância dos worker nodes."
  type        = list(string)
  default     = ["t3.small"]
}

variable "node_min_size" {
  description = "Mínimo de nodes EC2 no node group."
  type        = number
  default     = 3
}

variable "node_desired_size" {
  description = "Quantidade desejada de nodes EC2."
  type        = number
  default     = 3
}

variable "node_max_size" {
  description = "Máximo de nodes EC2."
  type        = number
  default     = 5
}

variable "node_disk_size" {
  description = "Tamanho do disco dos nodes em GB."
  type        = number
  default     = 20
}

variable "rds_db_name" {
  description = "Nome do banco PostgreSQL."
  type        = string
  default     = "appdb"
}

variable "rds_username" {
  description = "Usuário master do PostgreSQL."
  type        = string
  default     = "appuser"
}

variable "rds_password" {
  description = "Senha master do PostgreSQL. Em ambiente real, use AWS Secrets Manager ou variável sensível no CI."
  type        = string
  sensitive   = true
}

variable "rds_instance_class" {
  description = "Classe da instância RDS."
  type        = string
  default     = "db.t3.micro"
}

variable "rds_allocated_storage" {
  description = "Storage inicial do RDS em GB."
  type        = number
  default     = 20
}

variable "dynamodb_billing_mode" {
  description = "Modo de cobrança do DynamoDB."
  type        = string
  default     = "PAY_PER_REQUEST"
}

variable "enable_cloudwatch_observability_addon" {
  description = "Habilita o add-on Amazon CloudWatch Observability no EKS. Pode exigir permissão extra no lab."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags adicionais."
  type        = map(string)
  default     = {}
}
