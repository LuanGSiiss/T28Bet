resource "aws_db_subnet_group" "postgres" {
  name       = "${local.name}-postgres-subnet-group"
  subnet_ids = values(aws_subnet.private)[*].id

  tags = merge(local.common_tags, {
    Name = "${local.name}-postgres-subnet-group"
  })
}

resource "aws_security_group" "rds" {
  name        = "${local.name}-rds-sg"
  description = "Permite PostgreSQL a partir do EKS"
  vpc_id      = aws_vpc.this.id

  ingress {
    description     = "PostgreSQL from EKS cluster security group"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_eks_cluster.this.vpc_config[0].cluster_security_group_id]
  }

  egress {
    description = "Saida liberada"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name}-rds-sg"
  })
}

resource "aws_db_instance" "postgres" {
  identifier = "${local.name}-postgres"

  engine         = "postgres"
  engine_version = "16"
  instance_class = var.rds_instance_class

  db_name  = var.rds_db_name
  username = var.rds_username
  password = var.rds_password

  allocated_storage     = var.rds_allocated_storage
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  db_subnet_group_name   = aws_db_subnet_group.postgres.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  backup_retention_period = 1
  deletion_protection     = false
  skip_final_snapshot     = true

  auto_minor_version_upgrade = true
  apply_immediately          = true

  tags = merge(local.common_tags, {
    Name = "${local.name}-postgres"
  })
}
