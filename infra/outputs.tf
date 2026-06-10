output "aws_region" {
  value = var.aws_region
}

output "vpc_id" {
  value = aws_vpc.this.id
}

output "public_subnet_ids" {
  value = values(aws_subnet.public)[*].id
}

output "private_subnet_ids" {
  value = values(aws_subnet.private)[*].id
}

output "eks_cluster_name" {
  value = aws_eks_cluster.this.name
}

output "eks_cluster_endpoint" {
  value = aws_eks_cluster.this.endpoint
  sensitive = true
}

output "kubectl_config_command" {
  value = "aws eks update-kubeconfig --region ${var.aws_region} --name ${aws_eks_cluster.this.name}"
}

output "rds_postgres_endpoint" {
  value = aws_db_instance.postgres.address
}

output "rds_postgres_port" {
  value = aws_db_instance.postgres.port
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.app.name
}

output "sqs_queue_url" {
  value = aws_sqs_queue.app.url
}

output "sns_topic_arn" {
  value = aws_sns_topic.app.arn
}

output "load_balancer_controller_status_command" {
  value = "kubectl -n kube-system get deploy aws-load-balancer-controller"
}
