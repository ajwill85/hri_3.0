#!/bin/bash

# Human Risk Intelligence v3.0 - AWS S3 Deployment Script
# This script builds and deploys the React app to S3

set -e

echo "🚀 Starting deployment for Human Risk Intelligence v3.0..."

# Configuration
S3_BUCKET="www.humanriskintel.com"
CLOUDFRONT_DISTRIBUTION_ID="E3AAF2J7UR50VG"
AWS_REGION="us-east-2"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Build the project
echo -e "${YELLOW}🔨 Building the project...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed. dist directory not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}"

# Sync to S3
echo -e "${YELLOW}☁️  Uploading to S3 bucket: ${S3_BUCKET}...${NC}"

# Upload HTML files with proper cache headers
aws s3 sync dist/ s3://${S3_BUCKET}/ \
    --exclude "*" \
    --include "*.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --metadata-directive REPLACE \
    --region ${AWS_REGION}

# Upload JS and CSS files with long cache
aws s3 sync dist/ s3://${S3_BUCKET}/ \
    --exclude "*.html" \
    --cache-control "public, max-age=31536000, immutable" \
    --region ${AWS_REGION}

# Set proper content types
echo -e "${YELLOW}🔧 Setting content types...${NC}"
aws s3 cp s3://${S3_BUCKET}/ s3://${S3_BUCKET}/ \
    --exclude "*" \
    --include "*.js" \
    --content-type "application/javascript" \
    --metadata-directive REPLACE \
    --recursive \
    --region ${AWS_REGION}

aws s3 cp s3://${S3_BUCKET}/ s3://${S3_BUCKET}/ \
    --exclude "*" \
    --include "*.css" \
    --content-type "text/css" \
    --metadata-directive REPLACE \
    --recursive \
    --region ${AWS_REGION}

echo -e "${GREEN}✅ Files uploaded to S3 successfully!${NC}"

# Invalidate CloudFront cache (if distribution ID is provided)
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}🔄 Invalidating CloudFront cache...${NC}"
    aws cloudfront create-invalidation \
        --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} \
        --paths "/*"
    echo -e "${GREEN}✅ CloudFront cache invalidated!${NC}"
else
    echo -e "${YELLOW}⚠️  CloudFront distribution ID not set. Skipping cache invalidation.${NC}"
    echo -e "${YELLOW}   Add your distribution ID to this script to enable cache invalidation.${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your site should be live at: https://${S3_BUCKET}${NC}"
echo ""
