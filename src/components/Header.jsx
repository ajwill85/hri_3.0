import { useState, useEffect } from 'react'
import { Shield, Settings, Menu, X } from 'lucide-react'

function Header({ onSettingsClick }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          <div className="logo" onClick={() => scrollToSection('hero')}>
            <Shield className="logo-icon" />
            <span className="logo-text">
              <span className="logo-main">Human Risk Intelligence</span>
              <span className="logo-version">v3.0</span>
            </span>
          </div>

          <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <button onClick={() => scrollToSection('news')}>News Feed</button>
            <button onClick={() => scrollToSection('about')}>About</button>
            <button onClick={onSettingsClick} className="settings-btn">
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </nav>

          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
