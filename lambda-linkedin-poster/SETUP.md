# LinkedIn Auto-Poster Setup Guide

## Overview
This Lambda function automatically posts 3 articles per day from AI Security, Cloud Security, and Privacy categories to your LinkedIn business page.

## Prerequisites

### 1. LinkedIn App Setup
1. Go to https://www.linkedin.com/developers/apps
2. Click "Create app"
3. Fill in details:
   - **App name**: HRI Auto Poster
   - **LinkedIn Page**: Human Risk Intel (https://www.linkedin.com/company/human-risk-intel/)
   - **App logo**: Upload your logo
4. Click "Create app"

### 2. Request API Access
1. In your app, go to "Products" tab
2. Request access to:
   - **Share on LinkedIn** (required)
   - **Sign In with LinkedIn using OpenID Connect** (required for auth)
3. Wait for approval (usually instant for Share on LinkedIn)

### 3. Get OAuth Credentials
1. Go to "Auth" tab
2. Note your **Client ID** and **Client Secret**
3. Add Redirect URL: `https://localhost:3000/auth/callback` (for initial setup)

### 4. Get Access Token

**Option A: Using LinkedIn OAuth Playground**
1. Go to https://www.linkedin.com/developers/tools/oauth
2. Select your app
3. Select scopes: `w_organization_social`, `r_organization_social`
4. Click "Request access token"
5. Copy the access token

**Option B: Manual OAuth Flow** (more permanent)
```bash
# Step 1: Get authorization code
# Visit this URL in browser (replace CLIENT_ID):
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=https://localhost:3000/auth/callback&scope=w_organization_social%20r_organization_social

# Step 2: After authorization, you'll be redirected with a code
# Use that code to get access token:
curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_AUTH_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=https://localhost:3000/auth/callback"
```

### 5. Get Organization ID
```bash
# Use your access token to get org ID:
curl -X GET https://api.linkedin.com/v2/organizationAcls?q=roleAssignee \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Look for your company page in the response
# The ID will be in format: urn:li:organization:XXXXXX
```

## AWS Setup

### 1. Create DynamoDB Table
```bash
aws dynamodb create-table \
  --table-name hri-posted-articles \
  --attribute-definitions \
    AttributeName=articleUrl,AttributeType=S \
  --key-schema \
    AttributeName=articleUrl,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-2
```

### 2. Create Lambda Function
```bash
# Navigate to lambda directory
cd lambda-linkedin-poster

# Install dependencies
npm install

# Create deployment package
zip -r function.zip index.js node_modules/

# Create Lambda function
aws lambda create-function \
  --function-name hri-linkedin-poster \
  --runtime nodejs24.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 60 \
  --memory-size 256 \
  --region us-east-2 \
  --environment Variables="{LINKEDIN_ACCESS_TOKEN=YOUR_ACCESS_TOKEN}"
```

### 3. Create IAM Role
The Lambda needs permissions for:
- DynamoDB read/write on `hri-posted-articles` table
- CloudWatch Logs

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:us-east-2:*:table/hri-posted-articles"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

### 4. Schedule Daily Execution
```bash
# Create EventBridge rule to run daily at 9 AM EST
aws events put-rule \
  --name hri-linkedin-daily-post \
  --schedule-expression "cron(0 14 * * ? *)" \
  --region us-east-2

# Add Lambda as target
aws events put-targets \
  --rule hri-linkedin-daily-post \
  --targets "Id"="1","Arn"="arn:aws:lambda:us-east-2:YOUR_ACCOUNT_ID:function:hri-linkedin-poster" \
  --region us-east-2

# Grant EventBridge permission to invoke Lambda
aws lambda add-permission \
  --function-name hri-linkedin-poster \
  --statement-id AllowEventBridgeInvoke \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn arn:aws:events:us-east-2:YOUR_ACCOUNT_ID:rule/hri-linkedin-daily-post \
  --region us-east-2
```

## Configuration

### Update Organization ID
Edit `index.js` line 10:
```javascript
LINKEDIN_ORG_ID: 'urn:li:organization:YOUR_ORG_ID',
```

### Customize Categories
Edit `index.js` line 11 to change which categories to post:
```javascript
TARGET_CATEGORIES: ['AI Security', 'Cloud Security', 'Privacy'],
```

### Change Posts Per Day
Edit `index.js` line 12:
```javascript
POSTS_PER_DAY: 3,
```

## Testing

### Test Locally
```bash
# Set environment variable
export LINKEDIN_ACCESS_TOKEN="your_token_here"

# Run test
node test.js
```

### Test on AWS
```bash
# Invoke Lambda manually
aws lambda invoke \
  --function-name hri-linkedin-poster \
  --region us-east-2 \
  response.json

# View response
cat response.json
```

## Monitoring

### View Logs
```bash
# Get recent logs
aws logs tail /aws/lambda/hri-linkedin-poster --follow --region us-east-2
```

### Check Posted Articles
```bash
# Scan DynamoDB table
aws dynamodb scan \
  --table-name hri-posted-articles \
  --region us-east-2
```

## Troubleshooting

### "Access token not configured"
- Set environment variable in Lambda: `LINKEDIN_ACCESS_TOKEN`

### "LinkedIn API error: 401"
- Access token expired (LinkedIn tokens expire after 60 days)
- Regenerate token using OAuth flow

### "No new articles to post"
- All recent articles in target categories have been posted
- Check DynamoDB table to see what's been posted
- Consider expanding categories or reducing posting frequency

### "LinkedIn API error: 429"
- Rate limit exceeded
- Function waits 2 seconds between posts
- Don't run function too frequently

## Token Refresh

LinkedIn access tokens expire after 60 days. Options:

**Option 1: Manual refresh** (simple)
- Regenerate token monthly
- Update Lambda environment variable

**Option 2: Automated refresh** (advanced)
- Store refresh token in AWS Secrets Manager
- Add token refresh logic to Lambda
- Automatically get new access token when needed

## Cost Estimate

- **Lambda**: ~$0.20/month (1 execution/day)
- **DynamoDB**: ~$0.25/month (minimal reads/writes)
- **Total**: ~$0.50/month

## Next Steps

1. Complete LinkedIn app setup
2. Get access token
3. Get organization ID
4. Create DynamoDB table
5. Deploy Lambda function
6. Set up EventBridge schedule
7. Test with manual invocation
8. Monitor first few automated posts
