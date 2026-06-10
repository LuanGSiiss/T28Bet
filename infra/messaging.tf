resource "aws_sqs_queue" "app" {
  name                       = "${local.name}-queue"
  visibility_timeout_seconds = 30
  message_retention_seconds  = 345600

  tags = local.common_tags
}

resource "aws_sns_topic" "app" {
  name = "${local.name}-topic"

  tags = local.common_tags
}

resource "aws_sns_topic_subscription" "sqs" {
  topic_arn = aws_sns_topic.app.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.app.arn
}

data "aws_iam_policy_document" "sqs_allow_sns" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["sns.amazonaws.com"]
    }

    actions = [
      "sqs:SendMessage"
    ]

    resources = [
      aws_sqs_queue.app.arn
    ]

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_sns_topic.app.arn]
    }
  }
}

resource "aws_sqs_queue_policy" "allow_sns" {
  queue_url = aws_sqs_queue.app.id
  policy    = data.aws_iam_policy_document.sqs_allow_sns.json
}
