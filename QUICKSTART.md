# Quick Start Guide - HRI v3.0

Get your Human Risk Intelligence v3.0 web app up and running in minutes!

## 🚀 Local Development (5 minutes)

```bash
# 1. Navigate to project
cd hri_3.0

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open http://localhost:3000 in your browser. Done! 🎉

## ☁️ Deploy to AWS (10 minutes)

### Prerequisites
- AWS CLI installed and configured
- AWS account with S3 access

### Deploy

```bash
# 1. Update CloudFront ID in deploy-to-s3.sh (optional)
# Edit line 9: CLOUDFRONT_DISTRIBUTION_ID="your-id-here"

# 2. Run deployment
./deploy-to-s3.sh
```

That's it! Your site will be live at https://www.humanriskintel.com 🌐

## 🔧 Configuration

### Change API Endpoint

**Option 1: In the app**
1. Click Settings (top right)
2. Update API Endpoint URL
3. Click Save

**Option 2: In code**
Edit `src/App.jsx` line 16:
```javascript
const [apiEndpoint, setApiEndpoint] = useState('YOUR_API_URL')
```

## 📱 Test the App

1. **Refresh News** - Click the blue button to fetch articles
2. **Filter Topics** - Click topic buttons to filter news
3. **Read Articles** - Click "Read More" to open articles
4. **Settings** - Configure API and manage cache

## 🐛 Common Issues

### "Failed to fetch news"
- Check Settings → API Configuration
- Verify API endpoint is correct
- Test endpoint: `curl YOUR_API_URL`

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment fails
```bash
# Verify AWS credentials
aws sts get-caller-identity

# Check bucket access
aws s3 ls s3://www.humanriskintel.com/
```

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guide
- Customize topics in `src/components/NewsFilter.jsx`
- Modify styles in `src/App.css`

## 💡 Tips

- Use `npm run preview` to test production build locally
- Clear browser cache if changes don't appear
- Check browser console for errors
- All data is stored locally in your browser

## 📞 Need Help?

- Check [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section
- Review browser console for errors
- Verify AWS CloudWatch logs
- Test API endpoint separately

---

**Happy coding!** 🚀
