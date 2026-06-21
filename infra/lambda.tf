# 1. Puxa a role existente do laboratório ******REMOVER DEPOIS********
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# ------------------ Criando a função lambda de notification ------------------
data "archive_file" "lambda_notification_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/notification/conv"
  output_path = "${path.module}/lambda_notification.zip"
}

resource "aws_lambda_function" "notification" {
  filename      = data.archive_file.lambda_notification_zip.output_path
  function_name = "funcao-notification"
  role          = data.aws_iam_role.lab_role.arn

  handler       = "handler.handler" 
  runtime       = "nodejs24.x"

  source_code_hash = data.archive_file.lambda_notification_zip.output_base64sha256
}


# ------------------ Criando a função lambda de settlement ------------------
data "archive_file" "lambda_settlement_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/settlement/conv"
  output_path = "${path.module}/lambda_settlement.zip"
}

resource "aws_lambda_function" "settlement" {
  filename      = data.archive_file.lambda_settlement_zip.output_path
  function_name = "funcao-settlement"
  role          = data.aws_iam_role.lab_role.arn

  handler       = "handler.handler" 
  runtime       = "nodejs24.x"

	layers = [aws_lambda_layer_version.mongoose_layer.arn]

  source_code_hash = data.archive_file.lambda_settlement_zip.output_base64sha256

  memory_size = 256
}

# Criando as layers
data "archive_file" "layer_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/settlement/layer-mongoose"
  output_path = "${path.module}/mongoose_layer.zip"
}

resource "aws_lambda_layer_version" "mongoose_layer" {
  filename            = data.archive_file.layer_zip.output_path
  layer_name          = "mongoose-layer"
  description         = "Layer contendo o Mongoose para as funcoes do sistema"
  
  compatible_runtimes = ["nodejs24.x"] 

  source_code_hash    = data.archive_file.layer_zip.output_base64sha256
}