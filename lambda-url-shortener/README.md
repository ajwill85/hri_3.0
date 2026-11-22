# HRI URL Shortener Lambda

Serverless URL shortening service for HRI article sharing.

## Overview

This Lambda function provides two endpoints:
- **POST /share** - Create a short link for an article
- **GET /share/{shortCode}** - Retrieve article data by short code

## Features

- 6-character short codes (Base62: 0-9, a-z, A-Z)
- 56.8 billion possible combinations
- Automatic link expiration after 90 days (DynamoDB TTL)
- Click tracking and analytics
- Collision detection and retry logic
- Full CORS support

## Prerequisites

- Node.js 24.x
- AWS CLI configured
- AWS account with appropriate permissions

## Setup

### 1. Create Infrastructure

Run the infrastructure setup script to create DynamoDB table and IAM role:

```bash
./setup-infrastructure.sh
```

This will create:
- DynamoDB table: `hri-short-links`
- IAM role: `hri-url-shortener-role`
- Required policies for DynamoDB and CloudWatch Logs

### 2. Install Dependencies

```bash
npm install
```

### 3. Deploy Lambda Function

```bash
./deploy.sh
```

This will:
- Install dependencies
- Create deployment package
- Upload to AWS Lambda
- Configure environment variables

## Testing

### Local Testing

```bash
# Set environment variables
export TABLE_NAME=hri-short-links
export AWS_REGION=us-east-2

# Run tests
npm test
```

### AWS Testing

```bash
# Test creating a short link
aws lambda invoke \
  --function-name hri-url-shortener \
  --payload '{"httpMethod":"POST","path":"/share","body":"{\"title\":\"Test\",\"url\":\"https://example.com\"}"}' \
  --region us-east-2 \
  response.json

cat response.json

# Test retrieving a short link (replace abc123 with actual code)
aws lambda invoke \
  --function-name hri-url-shortener \
  --payload '{"httpMethod":"GET","path":"/share/abc123"}' \
  --region us-east-2 \
  response.json

cat response.json
```

## API Documentation

### POST /share

Create a short link for an article.

**Request Body:**
```json
{
  "title": "Article Title",
  "description": "Article description",
  "source": "Source Name",
  "url": "https://example.com/article",
  "pubDate": "2026-01-22T12:00:00Z",
  "categories": ["AI Security", "Data Breach"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "shortCode": "a7Bx9K",
  "shortUrl": "https://humanriskintel.com/s/a7Bx9K",
  "expiresAt": 1740240000
}
```

### GET /share/{shortCode}

Retrieve article data by short code.

**Response (200 OK):**
```json
{
  "success": true,
  "articleData": {
    "title": "Article Title",
    "description": "Article description",
    "source": "Source Name",
    "url": "https://example.com/article",
    "pubDate": "2026-01-22T12:00:00Z",
    "categories": ["AI Security", "Data Breach"]
  },
  "createdAt": 1737552000,
  "clicks": 5
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Short link not found or expired"
}
```

## Environment Variables

- `TABLE_NAME` - DynamoDB table name (default: `hri-short-links`)
- `AWS_REGION` - AWS region (default: `us-east-2`)
- `BASE_URL` - Base URL for short links (default: `https://humanriskintel.com`)
- `ALLOWED_ORIGINS` - Comma-separated browser origins allowed to call the API. Defaults to the production site hosts.
- `ALLOW_LOCALHOST` - Set to `true` to include local development origins when `ALLOWED_ORIGINS` is not set.

## DynamoDB Schema

**Table:** `hri-short-links`

| Field | Type | Description |
|-------|------|-------------|
| shortCode | String (PK) | 6-character unique identifier |
| articleData | String | JSON-encoded article object |
| createdAt | Number | Unix timestamp |
| expiresAt | Number | Unix timestamp (TTL) |
| clicks | Number | Click counter |
| lastAccessed | Number | Last access timestamp |

## Monitoring

### View Logs

```bash
aws logs tail /aws/lambda/hri-url-shortener --follow --region us-east-2
```

### Check DynamoDB

```bash
# Scan all short links
aws dynamodb scan \
  --table-name hri-short-links \
  --region us-east-2

# Get specific short link
aws dynamodb get-item \
  --table-name hri-short-links \
  --key '{"shortCode":{"S":"abc123"}}' \
  --region us-east-2
```

## Cost Estimate

- **Lambda**: ~$0.20/month (10K invocations)
- **DynamoDB**: ~$0.25/month (10K reads/writes)
- **Total**: ~$0.50/month

Scales to ~$2-3/month for 100K links.

## Troubleshooting

### "Failed to generate unique short code"
- Very rare with 6-character codes
- Increase retry attempts in code if needed

### "Access Denied" errors
- Check IAM role has DynamoDB permissions
- Verify table name matches environment variable

### Links not expiring
- Verify TTL is enabled on DynamoDB table
- Check `expiresAt` field is set correctly

## Next Steps

1. Configure API Gateway to route to this Lambda
2. Update frontend with API endpoint URL
3. Test end-to-end flow
4. Monitor usage and costs

## Version

1.0.0
