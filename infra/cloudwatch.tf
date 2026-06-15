resource "aws_cloudwatch_log_group" "application" {
  name              = "/aws/containerinsights/${local.name}/application"
  retention_in_days = 7

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "dataplane" {
  name              = "/aws/containerinsights/${local.name}/dataplane"
  retention_in_days = 7

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  alarm_name          = "${local.name}-rds-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgres.id
  }

  alarm_description = "CPU do RDS PostgreSQL acima de 80%."
  treat_missing_data = "notBreaching"

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "sqs_visible_messages_high" {
  alarm_name          = "${local.name}-sqs-visible-messages-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Average"
  threshold           = 100

  dimensions = {
    QueueName = aws_sqs_queue.app.name
  }

  alarm_description = "Fila SQS com mais de 100 mensagens visíveis."
  treat_missing_data = "notBreaching"

  tags = local.common_tags
}
