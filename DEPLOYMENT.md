# Deployment Guide - Human Risk Intelligence v3.0

This guide provides step-by-step instructions for deploying the HRI v3.0 web app to AWS.

## 📋 Prerequisites Checklist

- [ ] AWS Account with appropriate permissions
- [ ] AWS CLI installed and configured
- [ ] Node.js 18.x or higher installed
- [ ] Domain name configured (www.humanriskintel.com)
- [ ] SSL certificate in ACM (if using CloudFront)

## 🔐 AWS Permissions Required

Your AWS user/role needs the following permissions:
- S3: Full access to the target bucket
- CloudFront: Create invalidations
- ACM: View certificates (if using CloudFront)
- Route 53: Manage DNS records (if using Route 53)

## 🚀 Deployment Steps

### Step 1: Prepare the Application

```bash
# Navigate to project directory
cd /Users/ajmm/Library/CloudStorage/ProtonDrive-wraithprivacy@proton.me-folder/Work/repos/hri_3.0

# Install dependencies
npm install

# Test the build locally
npm run build
npm run preview
```

### Step 2: Configure AWS CLI

```bash
# Configure AWS credentials (if not already done)
aws configure

# Verify configuration
aws sts get-caller-identity

# Test S3 access
aws s3 ls s3://www.humanriskintel.com/
```

### Step 3: Update Deployment Script

Edit `deploy-to-s3.sh` and update the following variables:

```bash
S3_BUCKET="www.humanriskintel.com"
CLOUDFRONT_DISTRIBUTION_ID="YOUR_DISTRIBUTION_ID"  # Optional
AWS_REGION="us-east-2"
```

To find your CloudFront Distribution ID:
```bash
aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[?contains(@, 'humanriskintel.com')]].Id" --output text
```

### Step 4: Make Script Executable

```bash
chmod +x deploy-to-s3.sh
```

### Step 5: Deploy

```bash
./deploy-to-s3.sh
```

The script will:
1. ✅ Install dependencies (if needed)
2. ✅ Build the production bundle
3. ✅ Upload files to S3 with proper cache headers
4. ✅ Set correct content types
5. ✅ Invalidate CloudFront cache (if configured)

## 🔄 Manual Deployment (Alternative)

If you prefer to deploy manually:

### Build the Application

```bash
npm run build
```

### Upload to S3

```bash
# Upload HTML files (no cache)
aws s3 sync dist/ s3://www.humanriskintel.com/ \
  --exclude "*" \
  --include "*.html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --region us-east-2

# Upload assets (long cache)
aws s3 sync dist/ s3://www.humanriskintel.com/ \
  --exclude "*.html" \
  --cache-control "public, max-age=31536000, immutable" \
  --region us-east-2
```

### Invalidate CloudFront

```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## 🏗️ Infrastructure Setup (First Time)

### Option A: Using CloudFormation

```bash
# Create the stack
aws cloudformation create-stack \
  --stack-name hri-v3-infrastructure \
  --template-body file://cloudformation-template.yaml \
  --parameters ParameterKey=DomainName,ParameterValue=www.humanriskintel.com \
  --capabilities CAPABILITY_IAM \
  --region us-east-2

# Monitor stack creation
aws cloudformation describe-stacks \
  --stack-name hri-v3-infrastructure \
  --query "Stacks[0].StackStatus"

# Get outputs
aws cloudformation describe-stacks \
  --stack-name hri-v3-infrastructure \
  --query "Stacks[0].Outputs"
```

### Option B: Manual Setup

#### 1. Create S3 Bucket

```bash
aws s3 mb s3://www.humanriskintel.com --region us-east-2

# Enable static website hosting
aws s3 website s3://www.humanriskintel.com/ \
  --index-document index.html \
  --error-document index.html

# Set bucket policy for public read
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::www.humanriskintel.com/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket www.humanriskintel.com \
  --policy file://bucket-policy.json
```

#### 2. Configure CloudFront (Optional but Recommended)

1. Go to AWS Console → CloudFront
2. Create Distribution
3. Origin: S3 bucket (www.humanriskintel.com)
4. Alternate Domain Names: www.humanriskintel.com
5. SSL Certificate: Select your ACM certificate
6. Default Root Object: index.html
7. Error Pages: 404 → /index.html (200)

#### 3. Update DNS

**If using Cloudflare:**
1. Add CNAME record: www → [CloudFront domain]
2. Enable Proxy (orange cloud)
3. SSL/TLS mode: Full

**If using Route 53:**
```bash
# Create alias record
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_HOSTED_ZONE_ID \
  --change-batch file://dns-change.json
```

## 🔍 Verification

After deployment, verify everything is working:

```bash
# Check S3 files
aws s3 ls s3://www.humanriskintel.com/ --recursive

# Test website
curl -I https://www.humanriskintel.com

# Check CloudFront
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID
```

### Browser Testing

1. Open https://www.humanriskintel.com
2. Check browser console for errors
3. Test Settings → API Configuration
4. Click "Refresh News" to fetch articles
5. Test topic filters
6. Verify mobile responsiveness

## 🐛 Troubleshooting

### Issue: 403 Forbidden

**Solution:**
```bash
# Check bucket policy
aws s3api get-bucket-policy --bucket www.humanriskintel.com

# Verify public access settings
aws s3api get-public-access-block --bucket www.humanriskintel.com
```

### Issue: Old content still showing

**Solution:**
```bash
# Clear browser cache
# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Issue: API not working

**Solution:**
1. Check Settings → API Configuration
2. Verify Lambda function is deployed
3. Test API endpoint directly:
```bash
curl https://e1suks3vz6.execute-api.us-east-2.amazonaws.com/prod/news
```

### Issue: Build fails

**Solution:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

## 📊 Monitoring

### CloudWatch Metrics

Monitor your deployment:
- S3 bucket metrics
- CloudFront requests
- Lambda function invocations (for API)

### Cost Estimation

Typical monthly costs:
- S3 storage: ~$0.50
- CloudFront: ~$1-5 (depends on traffic)
- Route 53: ~$0.50 (if used)
- Lambda: ~$0.20 (for API)

**Total: ~$2-7/month**

## 🔄 Continuous Deployment

For automated deployments, consider:

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-2
      - run: ./deploy-to-s3.sh
```

## 📝 Post-Deployment Checklist

- [ ] Website loads at https://www.humanriskintel.com
- [ ] SSL certificate is valid
- [ ] All pages/routes work correctly
- [ ] API endpoint is configured and working
- [ ] News articles load successfully
- [ ] Topic filters work
- [ ] Settings modal opens and saves
- [ ] Mobile view is responsive
- [ ] Browser console has no errors
- [ ] CloudFront caching is working
- [ ] DNS propagation is complete

## 🔐 Security Best Practices

1. **Enable CloudFront logging**
2. **Set up AWS CloudTrail**
3. **Use least privilege IAM policies**
4. **Enable S3 versioning** (optional)
5. **Regular security audits**
6. **Keep dependencies updated**

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review AWS CloudWatch logs
3. Test API endpoint separately
4. Verify DNS configuration
5. Check browser console for errors

---

**Last Updated:** 2025-01-12
**Version:** 3.0.0
