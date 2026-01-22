#!/bin/bash

# HRI URL Shortener - Infrastructure Setup Script
# This script creates the DynamoDB table and Lambda function

set -e  # Exit on error

# Configuration
TABLE_NAME="hri-short-links"
FUNCTION_NAME="hri-url-shortener"
AWS_REGION="us-east-2"
AWS_PROFILE="${AWS_PROFILE:-default}"  # Use env var or default to 'default'
LAMBDA_ROLE_NAME="hri-url-shortener-role"

echo "🚀 Setting up HRI URL Shortener Infrastructure"
echo "=============================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI is not installed"
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --profile $AWS_PROFILE --query Account --output text)
echo "📋 AWS Account ID: $ACCOUNT_ID"
echo "📋 AWS Profile: $AWS_PROFILE"

# Step 1: Create DynamoDB Table
echo ""
echo "📊 Creating DynamoDB table: $TABLE_NAME"

if aws dynamodb describe-table --table-name $TABLE_NAME --region $AWS_REGION --profile $AWS_PROFILE &> /dev/null; then
    echo "✅ Table already exists"
else
    aws dynamodb create-table \
        --table-name $TABLE_NAME \
        --attribute-definitions \
            AttributeName=shortCode,AttributeType=S \
        --key-schema \
            AttributeName=shortCode,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region $AWS_REGION \
        --profile $AWS_PROFILE \
        --tags Key=Project,Value=HRI Key=Component,Value=URLShortener
    
    echo "⏳ Waiting for table to be active..."
    aws dynamodb wait table-exists --table-name $TABLE_NAME --region $AWS_REGION --profile $AWS_PROFILE
    echo "✅ Table created successfully"
fi

# Step 2: Enable TTL on expiresAt field
echo ""
echo "⏰ Enabling TTL for automatic link expiration"
aws dynamodb update-time-to-live \
    --table-name $TABLE_NAME \
    --time-to-live-specification "Enabled=true, AttributeName=expiresAt" \
    --region $AWS_REGION \
    --profile $AWS_PROFILE || echo "⚠️  TTL already enabled or failed to enable"

# Step 3: Create IAM Role for Lambda
echo ""
echo "🔐 Creating IAM role: $LAMBDA_ROLE_NAME"

TRUST_POLICY='{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}'

if aws iam get-role --role-name $LAMBDA_ROLE_NAME --profile $AWS_PROFILE &> /dev/null; then
    echo "✅ Role already exists"
else
    aws iam create-role \
        --role-name $LAMBDA_ROLE_NAME \
        --assume-role-policy-document "$TRUST_POLICY" \
        --description "Execution role for HRI URL Shortener Lambda" \
        --profile $AWS_PROFILE
    echo "✅ Role created"
fi

# Step 4: Attach policies to role
echo ""
echo "📎 Attaching policies to role"

# CloudWatch Logs policy
aws iam attach-role-policy \
    --role-name $LAMBDA_ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
    --profile $AWS_PROFILE

# DynamoDB policy
DYNAMODB_POLICY='{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": "arn:aws:dynamodb:'$AWS_REGION':'$ACCOUNT_ID':table/'$TABLE_NAME'"
    }
  ]
}'

POLICY_NAME="hri-url-shortener-dynamodb-policy"

if aws iam get-policy --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/$POLICY_NAME --profile $AWS_PROFILE &> /dev/null; then
    echo "✅ DynamoDB policy already exists"
else
    aws iam create-policy \
        --policy-name $POLICY_NAME \
        --policy-document "$DYNAMODB_POLICY" \
        --description "DynamoDB access for HRI URL Shortener" \
        --profile $AWS_PROFILE
    echo "✅ DynamoDB policy created"
fi

aws iam attach-role-policy \
    --role-name $LAMBDA_ROLE_NAME \
    --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/$POLICY_NAME \
    --profile $AWS_PROFILE

echo "✅ Policies attached"

# Wait for role to propagate
echo "⏳ Waiting for IAM role to propagate (10 seconds)..."
sleep 10

echo ""
echo "=============================================="
echo "✨ Infrastructure setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'cd lambda-url-shortener && npm install'"
echo "2. Run './deploy.sh' to deploy the Lambda function"
echo "3. Configure API Gateway to route to this Lambda"
echo ""
echo "Resources created:"
echo "- DynamoDB Table: $TABLE_NAME"
echo "- IAM Role: $LAMBDA_ROLE_NAME"
echo "- Region: $AWS_REGION"
