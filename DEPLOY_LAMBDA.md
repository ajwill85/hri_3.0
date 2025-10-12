# 🚀 Deploy Lambda Function - Quick Guide

## ⚠️ IMPORTANT: Lambda Must Be Deployed First!

The new sources (The Record, Ars Technica, Wired) will **NOT** appear until you deploy the updated Lambda function to AWS.

---

## 📋 Quick Deployment Steps

### **Option 1: AWS Console (Easiest - 2 minutes)**

1. **Open the Lambda function code:**
   - File: `/lambda-function/index.js`
   - Select ALL text (Cmd+A)
   - Copy (Cmd+C)

2. **Go to AWS Lambda Console:**
   - Open: https://console.aws.amazon.com/lambda
   - Region: **us-east-2** (Ohio)
   - Find function: `hri-news-aggregator`

3. **Update the code:**
   - Click "Code" tab
   - Select all existing code in editor
   - Paste your copied code
   - Click **"Deploy"** button (orange button at top)
   - Wait for "Successfully deployed" message

4. **Test it:**
   - Click "Test" tab
   - Click "Test" button
   - Check response shows `"version": "2.1.0"`
   - Check `"count"` is around 50-60 articles

5. **Verify new sources:**
   - Look for articles from:
     - "The Record"
     - "Ars Technica"
     - "Wired"

---

### **Option 2: AWS CLI (For Advanced Users)**

```bash
# Navigate to lambda function directory
cd lambda-function

# Create deployment package (includes node_modules)
zip -r function.zip index.js node_modules/

# Deploy to AWS
aws lambda update-function-code \
  --function-name hri-news-aggregator \
  --zip-file fileb://function.zip \
  --region us-east-2

# Test the function
aws lambda invoke \
  --function-name hri-news-aggregator \
  --region us-east-2 \
  --payload '{"httpMethod":"GET"}' \
  response.json

# View response
cat response.json | jq .

# Cleanup
rm function.zip response.json
```

---

## ✅ Verification Checklist

After deploying Lambda:

### **1. Check Lambda Version**
- [ ] Test Lambda function
- [ ] Response shows `"version": "2.1.0"`
- [ ] Response shows `"count": 50-60` articles

### **2. Check Frontend**
- [ ] Refresh your web app (Cmd+Shift+R)
- [ ] Click "Refresh News" button
- [ ] Open Settings → News Sources
- [ ] Click "Show Debug Info"
- [ ] Should now see:
  - [ ] "The Record" or "therecord.media"
  - [ ] "Ars Technica"
  - [ ] "Wired"

### **3. Test Source Filtering**
- [ ] Open Settings
- [ ] Disable all sources
- [ ] Enable only "The Record"
- [ ] Click "Save Endpoint"
- [ ] Close Settings
- [ ] Should see articles from The Record

---

## 🐛 Troubleshooting

### **Issue: Debug info doesn't show new sources**
**Cause:** Lambda not deployed yet  
**Fix:** Deploy Lambda function first (see above)

### **Issue: "Successfully deployed" but no new articles**
**Cause:** Browser cache  
**Fix:**
1. Open Settings
2. Click "Clear Cache"
3. Click "Refresh News"
4. Hard refresh browser (Cmd+Shift+R)

### **Issue: Lambda test fails**
**Cause:** Syntax error or timeout  
**Fix:**
1. Check CloudWatch logs
2. Verify code was pasted correctly
3. Check for missing commas/brackets

### **Issue: Some feeds fail to load**
**Cause:** Feed temporarily down or timeout  
**Fix:**
- This is normal - Lambda has 8-second timeout per feed
- Check CloudWatch logs for specific errors
- Most feeds should succeed (6-7 out of 8)

---

## 📊 Expected Results

### **Before Lambda Deployment:**
- Debug info shows: 5 sources (original sources only)
- Article count: ~40-45 articles
- New source filters don't work

### **After Lambda Deployment:**
- Debug info shows: 8-9 sources (including new ones)
- Article count: ~50-65 articles
- All source filters work
- Version shows 2.1.0

---

## 🔍 How to Check Current Lambda Version

### **Method 1: Test Lambda**
```bash
aws lambda invoke \
  --function-name hri-news-aggregator \
  --region us-east-2 \
  --payload '{"httpMethod":"GET"}' \
  response.json && cat response.json | jq '.version'
```

Should return: `"2.1.0"`

### **Method 2: Check in Browser**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click "Refresh News"
4. Find request to API Gateway
5. Check response JSON
6. Look for `"version": "2.1.0"`

---

## 📝 What the Lambda Update Does

### **Adds 3 New RSS Feeds:**
1. **The Record** (`https://therecord.media/feed/`)
   - Investigative journalism
   - Threat intelligence focus
   - APT coverage

2. **Ars Technica Security** (`https://arstechnica.com/security/feed/`)
   - Technical deep dives
   - Vulnerability analysis
   - Expert commentary

3. **Wired Security** (`https://www.wired.com/feed/category/security/latest/rss`)
   - Privacy focus
   - Mainstream appeal
   - Long-form journalism

### **Updates Version:**
- From: `2.0.0`
- To: `2.1.0`

---

## ⏱️ Deployment Time

- **AWS Console:** ~2 minutes
- **AWS CLI:** ~1 minute
- **Propagation:** Immediate (no CDN cache)

---

## 🎯 Next Steps

1. **Deploy Lambda** (see Option 1 above)
2. **Wait 10 seconds** for deployment
3. **Test Lambda** to verify
4. **Refresh frontend** (hard refresh)
5. **Click "Refresh News"** in app
6. **Check Debug Info** - should show new sources
7. **Test filtering** - enable only new sources

---

## 💡 Pro Tip

After deploying Lambda, always:
1. Clear browser cache (Settings → Clear Cache)
2. Click "Refresh News" button
3. Hard refresh browser (Cmd+Shift+R)

This ensures you're seeing fresh data from the updated Lambda.

---

**Status:** Lambda code ready, needs deployment  
**File:** `/lambda-function/index.js`  
**Target:** AWS Lambda `hri-news-aggregator` (us-east-2)  
**Estimated Time:** 2 minutes  
