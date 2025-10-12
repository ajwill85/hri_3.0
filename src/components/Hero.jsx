import { RefreshCw, TrendingUp, Clock } from 'lucide-react'

function Hero({ articleCount, lastRefresh, onRefresh, loading }) {
  const formatTime = (date) => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return date.toLocaleDateString()
  }

  return (
    <section className="hero" id="hero">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Real-Time Cybersecurity Intelligence
          </h1>
          <p className="hero-subtitle">
            Stay ahead of threats with aggregated news from trusted sources, 
            Reddit r/netsec, and Hacker News
          </p>
          
          <div className="hero-stats">
            <div className="stat-card">
              <TrendingUp className="stat-icon" />
              <div className="stat-content">
                <div className="stat-value">{articleCount}</div>
                <div className="stat-label">Articles Loaded</div>
              </div>
            </div>
            
            <div className="stat-card">
              <Clock className="stat-icon" />
              <div className="stat-content">
                <div className="stat-value">{formatTime(lastRefresh)}</div>
                <div className="stat-label">Last Updated</div>
              </div>
            </div>
          </div>

          <button 
            className={`refresh-btn ${loading ? 'loading' : ''}`}
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={loading ? 'spinning' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh News'}</span>
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero
