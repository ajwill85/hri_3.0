# Human Risk Intelligence v3.0

A modern, React-based cybersecurity news aggregator that provides real-time intelligence from trusted sources including RSS feeds, Reddit r/netsec, and Hacker News.

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Vite](https://img.shields.io/badge/Vite-5.0.8-646cff)
![AWS](https://img.shields.io/badge/AWS-S3%20%7C%20CloudFront-orange)

## 🚀 Features

- **Real-Time News Aggregation** - Fetch live cybersecurity news from multiple sources
- **Smart Categorization** - Filter by 13 topics including AI Security, Cloud Security, Privacy, and more
- **"All" Button** - View all news or filter by specific topics with one click
- **Modern UI/UX** - Built with React and modern design principles
- **Offline Caching** - Local storage for offline access
- **Privacy Focused** - All data stored locally in your browser
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark Theme** - Easy on the eyes with a professional dark interface
- **Smooth Animations** - Polished user experience with CSS animations

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- AWS CLI (for deployment)
- AWS Account with appropriate permissions

## 🛠️ Installation

1. **Clone or navigate to the repository:**
   ```bash
   cd hri_3.0
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file (optional):**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to customize your API endpoint if needed.

## 💻 Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
hri_3.0/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Navigation header
│   │   ├── Hero.jsx            # Hero section with stats
│   │   ├── NewsFilter.jsx      # Topic filter buttons
│   │   ├── NewsFeed.jsx        # News articles grid
│   │   ├── Settings.jsx        # Settings modal
│   │   └── Footer.jsx          # Footer with links
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # Component styles
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles
├── public/
│   └── hri-icon.svg            # App icon
├── index.html                  # HTML template
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
└── README.md                   # This file
```

## 🎨 Customization

### Changing the API Endpoint

1. **In the app:** Click Settings → API Configuration → Update endpoint
2. **In code:** Edit `src/App.jsx` and change the default `apiEndpoint` value
3. **Via environment:** Set `VITE_API_ENDPOINT` in `.env`

### Modifying Topics

Edit the `topics` array in `src/components/NewsFilter.jsx`:

```javascript
const topics = [
  { id: 'your-topic', label: 'Your Topic', icon: '🔥' },
  // Add more topics...
]
```

**Current Topics (15 total):**

**Tier 1: Core Security**
- AI Security 🤖
- Cloud Security ☁️
- Ransomware 🔐
- Data Breach 💥
- Vulnerabilities ⚠️
- Zero-Day Exploits ⚡

**Tier 2: Attack Vectors**
- Phishing & Email Threats 🎣
- Social Engineering 🎭
- Insider Threats 👤

**Tier 3: Technical Domains**
- Identity & Access Management 🔐
- Application Security 💻
- Endpoint Security 🖥️
- Infrastructure Security 🌐

**Tier 4: Governance**
- Privacy & Compliance 🔒
- Threat Intelligence 🔍

### Styling

- **Global styles:** `src/index.css`
- **Component styles:** `src/App.css`
- **Color scheme:** CSS variables in `:root` selector

## 🚀 Deployment

### Build for Production

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder to your hosting provider**

The app can be deployed to any static hosting service such as:
- AWS S3 + CloudFront
- Netlify
- Vercel
- GitHub Pages
- Any other static hosting provider

## 🔧 Infrastructure

The application is a static React web app that can be hosted on any static hosting service. It connects to a backend API for news aggregation.

### Recommended AWS Services

- **S3** - Static website hosting
- **CloudFront** - CDN for global distribution
- **API Gateway** - Backend API endpoint
- **Lambda** - News aggregation function

## 🔌 Backend API

The app connects to a backend API that aggregates news from multiple sources. Configure your API endpoint in the Settings panel or via the `VITE_API_ENDPOINT` environment variable.

### News Sources

- Krebs on Security
- The Hacker News
- Dark Reading
- Threatpost
- Reddit r/netsec
- Hacker News (YCombinator)

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔒 Privacy & Security

- All preferences stored locally in browser
- No personal data collected
- No tracking or analytics (unless configured)
- HTTPS enforced via CloudFront
- CORS properly configured

## 🐛 Troubleshooting

### Build Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Connection Issues

1. Check Settings → API Configuration
2. Verify the API endpoint is correct
3. Check browser console for errors
4. Ensure Lambda function is deployed and accessible

### Deployment Issues

- Verify your hosting provider's deployment settings
- Ensure the build completed successfully
- Check that all environment variables are set correctly

## 📝 Version History

### v3.0.0 (Current)
- Complete rewrite using React + Vite
- Modern component-based architecture
- Improved UI/UX with animations
- Better mobile responsiveness
- Enhanced error handling
- Local storage caching

### v2.0.0
- Single-page HTML application
- Basic news aggregation
- Manual API configuration

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

© 2025 Human Risk Intelligence. All rights reserved.

## 👤 Author

**Akeem Williams**
- Portfolio: [ajwill.ai](https://ajwill.ai)
- LinkedIn: [williamsakeem](https://linkedin.com/in/williamsakeem)
- GitHub: [ajwill85](https://github.com/ajwill85)
- Email: ajwilliams85@gmail.com

## 🔗 Links

- **Live Site:** [www.humanriskintel.com](https://www.humanriskintel.com)
- **Newsletter:** [Human Risk Intel Newsletter](https://humanriskintel.beehiiv.com)
- **Portfolio:** [ajwill.ai](https://ajwill.ai)

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Vite](https://vitejs.dev/)
- Icons from [Lucide](https://lucide.dev/)
- Hosted on [AWS](https://aws.amazon.com/)

---

**Note:** This application requires the HRI News Aggregator Lambda function (v2.0.0) to be deployed and accessible. Make sure your API endpoint is properly configured in the Settings.
