# Lambda Function Deployment Guide

## 📦 Version 2.1.0 - Phase 1 Sources Added

### What's New
Added 3 high-quality news sources:
- **The Record** - Investigative journalism, threat intelligence
- **Ars Technica Security** - Deep technical analysis
- **Wired Security** - Mainstream appeal, privacy focus

---

## 🚀 Quick Deployment

### Option 1: AWS Console (Easiest)

1. **Navigate to Lambda Function**
   ```
   AWS Console → Lambda → hri-news-aggregator
   ```

2. **Update Code**
   - Click "Code" tab
   - Select all text in `index.js`
   - Copy content from `lambda-function/index.js`
   - Paste into AWS editor
   - Click "Deploy"

3. **Test**
   - Click "Test" tab
   - Create test event (if not exists):
     ```json
     {
       "httpMethod": "GET"
     }
     ```
   - Click "Test"
   - Verify response shows 8 sources

---

### Option 2: AWS CLI (Faster)

```bash
# Navigate to lambda-function directory
cd lambda-function

# Create deployment package
zip -r function.zip index.js node_modules/

# Update Lambda function
aws lambda update-function-code \
  --function-name hri-news-aggregator \
  --zip-file fileb://function.zip \
  --region us-east-2

# Verify
aws lambda get-function \
  --function-name hri-news-aggregator \
  --region us-east-2
```

---

### Option 3: Automated Script

Create `deploy-lambda.sh`:

```bash
#!/bin/bash
set -e

echo "📦 Creating Lambda deployment package..."
cd lambda-function
zip -r function.zip index.js node_modules/

echo "🚀 Deploying to AWS Lambda..."
aws lambda update-function-code \
  --function-name hri-news-aggregator \
  --zip-file fileb://function.zip \
  --region us-east-2

echo "✅ Deployment complete!"
echo "🧪 Testing function..."
aws lambda invoke \
  --function-name hri-news-aggregator \
  --region us-east-2 \
  --payload '{"httpMethod":"GET"}' \
  response.json

echo "📊 Response:"
cat response.json | jq .

rm function.zip response.json
```

Make executable and run:
```bash
chmod +x deploy-lambda.sh
./deploy-lambda.sh
```

---

## 📊 Current Sources (8 Total)

### Original Sources (5)
1. **Krebs on Security** - Brian Krebs' investigative reporting
2. **BleepingComputer** - Breaking news, malware analysis
3. **Dark Reading** - Enterprise security news
4. **The Hacker News** - Daily security news
5. **SecurityWeek** - Industry news, vulnerabilities

### Phase 1 Additions (3)
6. **The Record** - Investigative journalism, APT coverage
7. **Ars Technica Security** - Technical deep dives
8. **Wired Security** - Privacy, mainstream security

### Plus
- **Reddit r/netsec** - Community discussions (5 posts)

---

## 🧪 Testing

### Test in AWS Console
1. Go to Lambda function
2. Click "Test" tab
3. Run test event
4. Check response:
   ```json
   {
     "success": true,
     "count": 50,
     "sources": {
       "rss": 45,
       "reddit": 5
     },
     "version": "2.1.0"
   }
   ```

### Test via API Gateway
```bash
curl https://e1suks3vz6.execute-api.us-east-2.amazonaws.com/prod/news | jq .
```

Expected output:
- `version: "2.1.0"`
- `count: 50` (or close to it)
- Articles from 8 different sources

---

## 📈 Expected Impact

### Article Volume
- **Before:** ~40-45 articles per fetch
- **After:** ~50-60 articles per fetch
- **Increase:** +20-30% more content

### Content Quality
- More investigative journalism (The Record)
- Better technical analysis (Ars Technica)
- Improved privacy coverage (Wired)
- Broader audience appeal

### Topic Coverage
All 15 topics should now have better coverage:
- **Ransomware** - Better coverage from all sources
- **Zero-Day** - Ars Technica excels here
- **Privacy** - Wired's specialty
- **Threat Intelligence** - The Record's focus
- **APTs** - The Record tracks nation-state actors

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] Lambda function shows version `2.1.0`
- [ ] Test execution succeeds
- [ ] Response includes ~50 articles
- [ ] Articles from new sources appear:
  - [ ] The Record (therecord.media)
  - [ ] Ars Technica
  - [ ] Wired
- [ ] Frontend displays new articles
- [ ] All topic filters work
- [ ] No errors in CloudWatch logs

---

## 📝 CloudWatch Logs

Check logs after deployment:
```bash
aws logs tail /aws/lambda/hri-news-aggregator --follow
```

Look for:
```
Successfully fetched therecord: X items
Successfully fetched arstechnica: X items
Successfully fetched wired: X items
```

---

## 🐛 Troubleshooting

### Issue: Function times out
**Solution:** Increase timeout in Lambda configuration:
```bash
aws lambda update-function-configuration \
  --function-name hri-news-aggregator \
  --timeout 30 \
  --region us-east-2
```

### Issue: Some feeds fail
**Check CloudWatch logs for:**
- Network errors
- RSS parsing errors
- Timeout issues

**Common causes:**
- Feed temporarily down
- Rate limiting
- SSL certificate issues

### Issue: Duplicate articles
**This is normal** - The function deduplicates by title
- Check logs: "Processed X unique articles"
- Duplicates are automatically removed

---

## 🔄 Rollback

If issues occur, rollback to previous version:

```bash
# List versions
aws lambda list-versions-by-function \
  --function-name hri-news-aggregator \
  --region us-east-2

# Rollback to previous version
aws lambda update-alias \
  --function-name hri-news-aggregator \
  --name PROD \
  --function-version <previous-version> \
  --region us-east-2
```

Or simply re-deploy the old `index.js` file.

---

## 📊 Monitoring

### Key Metrics to Watch
- **Invocation count** - Should be same as before
- **Duration** - May increase slightly (more feeds)
- **Error rate** - Should remain low (<1%)
- **Throttles** - Should be 0

### CloudWatch Dashboard
Create dashboard to monitor:
- Invocations per hour
- Average duration
- Error count
- Article count per source

---

## 🎯 Next Steps

After successful deployment:

1. **Monitor for 24 hours**
   - Check CloudWatch logs
   - Verify article quality
   - Monitor error rates

2. **User feedback**
   - Are new sources valuable?
   - Any duplicate content issues?
   - Topic coverage improved?

3. **Phase 2 Planning**
   - Add 5 more sources when ready
   - See recommendations in main docs

---

## 📞 Support

**Lambda Function Issues:**
- Check CloudWatch logs
- Verify RSS feed URLs are accessible
- Test individual feeds manually

**Frontend Issues:**
- Clear browser cache
- Check API endpoint in Settings
- Verify CORS headers in response

---

**Deployment Date:** 2025-01-12  
**Version:** 2.1.0  
**Status:** Ready to Deploy  
**Estimated Deployment Time:** 5 minutes  
