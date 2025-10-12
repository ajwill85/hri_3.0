# 🚀 Deployment Checklist - HRI v3.0

Use this checklist to ensure a smooth deployment to AWS.

## ✅ Pre-Deployment

### Local Development
- [ ] Navigate to project directory: `cd hri_3.0`
- [ ] Install dependencies: `npm install`
- [ ] Start dev server: `npm run dev`
- [ ] Test in browser at http://localhost:3000
- [ ] Verify all features work:
  - [ ] News loads from API
  - [ ] Topic filters work
  - [ ] Settings modal opens/closes
  - [ ] Refresh button works
  - [ ] Mobile view is responsive
- [ ] Check browser console for errors
- [ ] Test production build: `npm run build && npm run preview`

### AWS Prerequisites
- [ ] AWS CLI installed: `aws --version`
- [ ] AWS credentials configured: `aws configure`
- [ ] Verify credentials: `aws sts get-caller-identity`
- [ ] S3 bucket exists: `aws s3 ls s3://www.humanriskintel.com/`
- [ ] CloudFront distribution ID obtained (optional)

### Configuration
- [ ] Review `deploy-to-s3.sh` settings:
  - [ ] S3_BUCKET="www.humanriskintel.com"
  - [ ] AWS_REGION="us-east-2"
  - [ ] CLOUDFRONT_DISTRIBUTION_ID (add if available)
- [ ] Script is executable: `chmod +x deploy-to-s3.sh`
- [ ] API endpoint configured in `src/App.jsx` (line 16)

## 🚀 Deployment

### Build & Deploy
- [ ] Clean build: `rm -rf dist node_modules && npm install`
- [ ] Build project: `npm run build`
- [ ] Verify dist folder created: `ls -la dist/`
- [ ] Run deployment script: `./deploy-to-s3.sh`
- [ ] Watch for success messages:
  - [ ] ✅ Build completed
  - [ ] ✅ Files uploaded to S3
  - [ ] ✅ CloudFront invalidated (if configured)

### Alternative Manual Deployment
If script fails, deploy manually:
```bash
# Build
npm run build

# Upload HTML (no cache)
aws s3 sync dist/ s3://www.humanriskintel.com/ \
  --exclude "*" --include "*.html" \
  --cache-control "no-cache" \
  --region us-east-2

# Upload assets (long cache)
aws s3 sync dist/ s3://www.humanriskintel.com/ \
  --exclude "*.html" \
  --cache-control "public, max-age=31536000" \
  --region us-east-2

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_ID \
  --paths "/*"
```

## ✅ Post-Deployment Verification

### Basic Checks
- [ ] Website loads: https://www.humanriskintel.com
- [ ] SSL certificate is valid (green padlock)
- [ ] No browser console errors
- [ ] Page loads in < 3 seconds

### Functionality Tests
- [ ] Header displays correctly
- [ ] Hero section shows stats
- [ ] "Refresh News" button works
- [ ] News articles load from API
- [ ] Topic filters work
- [ ] Article cards display properly
- [ ] "Read More" links open in new tab
- [ ] Settings modal opens
- [ ] API endpoint can be changed
- [ ] Cache can be cleared
- [ ] Footer displays correctly
- [ ] All links work

### Responsive Testing
- [ ] Desktop view (1920x1080)
- [ ] Laptop view (1366x768)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)
- [ ] Mobile menu works
- [ ] Touch interactions work

### Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Performance Checks
- [ ] Run Lighthouse audit
  - [ ] Performance > 90
  - [ ] Accessibility > 90
  - [ ] Best Practices > 90
  - [ ] SEO > 90
- [ ] Check page load time
- [ ] Verify images load quickly
- [ ] Test with slow 3G throttling

### AWS Verification
- [ ] S3 bucket has files: `aws s3 ls s3://www.humanriskintel.com/ --recursive`
- [ ] CloudFront distribution active
- [ ] DNS resolves correctly: `nslookup www.humanriskintel.com`
- [ ] HTTPS redirects working
- [ ] Error pages work (404 → index.html)

## 🔧 Troubleshooting

### Issue: Build Fails
```bash
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Issue: 403 Forbidden
```bash
# Check bucket policy
aws s3api get-bucket-policy --bucket www.humanriskintel.com

# Check public access
aws s3api get-public-access-block --bucket www.humanriskintel.com
```

### Issue: Old Content Showing
```bash
# Clear browser cache (Cmd+Shift+R on Mac)
# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_ID \
  --paths "/*"
```

### Issue: API Not Working
- [ ] Check Settings → API Configuration
- [ ] Test API directly: `curl https://e1suks3vz6.execute-api.us-east-2.amazonaws.com/prod/news`
- [ ] Verify Lambda function is running
- [ ] Check API Gateway logs

### Issue: Deployment Script Fails
- [ ] Verify AWS credentials: `aws sts get-caller-identity`
- [ ] Check S3 permissions
- [ ] Review script output for errors
- [ ] Try manual deployment instead

## 📊 Monitoring

### Initial Monitoring (First 24 hours)
- [ ] Check CloudWatch metrics
- [ ] Monitor S3 request counts
- [ ] Review CloudFront statistics
- [ ] Check for error logs
- [ ] Monitor Lambda invocations (API)

### Ongoing Monitoring
- [ ] Set up CloudWatch alarms
- [ ] Enable S3 access logging
- [ ] Enable CloudFront logging
- [ ] Review costs weekly
- [ ] Update dependencies monthly

## 🔐 Security Review

- [ ] HTTPS enforced (no HTTP access)
- [ ] SSL certificate valid
- [ ] CORS configured properly
- [ ] No API keys in frontend code
- [ ] No console.log in production
- [ ] Dependencies have no vulnerabilities: `npm audit`
- [ ] S3 bucket not publicly writable
- [ ] CloudFront using latest TLS version

## 📝 Documentation

- [ ] Update README.md if needed
- [ ] Document any custom configurations
- [ ] Note CloudFront distribution ID
- [ ] Save deployment date
- [ ] Record any issues encountered

## 🎉 Launch Checklist

- [ ] All tests passed
- [ ] Performance acceptable
- [ ] No critical errors
- [ ] Team/stakeholders notified
- [ ] Social media announcement (optional)
- [ ] Newsletter sent (optional)
- [ ] Analytics configured (optional)

## 📞 Rollback Plan

If something goes wrong:

1. **Quick Rollback:**
   ```bash
   # Upload previous version from backup
   aws s3 sync backup/ s3://www.humanriskintel.com/
   aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
   ```

2. **Restore from S3 Versioning:**
   ```bash
   # If versioning enabled
   aws s3api list-object-versions --bucket www.humanriskintel.com
   # Restore specific version
   ```

3. **Emergency Contact:**
   - AWS Support
   - Cloudflare Support (if using)
   - Check AWS Service Health Dashboard

## ✅ Sign-Off

- [ ] Deployment completed successfully
- [ ] All tests passed
- [ ] Documentation updated
- [ ] Monitoring configured
- [ ] Team notified

**Deployed By:** _________________
**Date:** _________________
**Version:** 3.0.0
**Time:** _________________

---

## 📋 Quick Command Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview build

# Deployment
./deploy-to-s3.sh        # Deploy to AWS

# AWS Commands
aws s3 ls s3://www.humanriskintel.com/
aws cloudfront create-invalidation --distribution-id ID --paths "/*"
aws sts get-caller-identity

# Troubleshooting
npm install              # Install dependencies
rm -rf node_modules      # Clean install
npm audit fix            # Fix vulnerabilities
```

---

**Good luck with your deployment! 🚀**
