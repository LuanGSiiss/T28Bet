#!/bin/bash
# Creates the SNS topic used by the settlement Lambda for result notifications.
# When Terraform provisions real AWS infrastructure, this script is not used —
# the topic ARN is read from SNS_RESULTS_TOPIC_ARN environment variable.

awslocal sns create-topic --name t28bet-results
echo "[localstack-init] SNS topic t28bet-results created"
