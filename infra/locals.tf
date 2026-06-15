locals {
  name = var.project_name

  common_tags = merge(
    {
      Project     = var.project_name
      Environment = "lab"
      ManagedBy   = "terraform"
    },
    var.tags
  )
}
