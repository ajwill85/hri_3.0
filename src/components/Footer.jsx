import { Shield, Github, Linkedin, Mail } from 'lucide-react'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer" id="about">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <Shield size={32} />
              <span>Human Risk Intelligence</span>
            </div>
            <p className="footer-description">
              Real-time cybersecurity news aggregation from trusted sources. 
              Stay informed about the latest threats, vulnerabilities, and security trends.
            </p>
          </div>

          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>Live News Updates</li>
              <li>Multiple RSS Sources</li>
              <li>Reddit & Hacker News</li>
              <li>Smart Categorization</li>
              <li>Offline Caching</li>
              <li>Privacy Focused</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li>
                <a href="https://github.com/ajwill85" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://humanriskintel.beehiiv.com" target="_blank" rel="noopener noreferrer">
                  Newsletter
                </a>
              </li>
              <li>
                <a href="https://ajwill.ai" target="_blank" rel="noopener noreferrer">
                  Portfolio
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a 
                href="https://github.com/ajwill85" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="https://linkedin.com/in/williamsakeem" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="mailto:ajwilliams85@gmail.com"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} Human Risk Intelligence. All rights reserved.</p>
          <p className="version">v3.0.0 - Live News Edition</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
