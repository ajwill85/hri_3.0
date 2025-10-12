import { X, Save, Trash2, Info } from 'lucide-react'
import { useState, useEffect } from 'react'

function Settings({ apiEndpoint, onApiEndpointChange, onClose, onClearCache, enabledSources, onSourcesChange, articles }) {
  const [tempEndpoint, setTempEndpoint] = useState(apiEndpoint)
  const [saved, setSaved] = useState(false)
  const [localEnabledSources, setLocalEnabledSources] = useState(enabledSources)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    setLocalEnabledSources(enabledSources)
  }, [enabledSources])

  // Get unique source names from articles for debugging
  const getActualSources = () => {
    if (!articles || articles.length === 0) return []
    const sources = new Set(articles.map(a => a.source).filter(Boolean))
    return Array.from(sources).sort()
  }

  const handleSave = () => {
    onApiEndpointChange(tempEndpoint)
    onSourcesChange(localEnabledSources)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleSource = (sourceId) => {
    setLocalEnabledSources(prev => {
      if (prev.includes(sourceId)) {
        return prev.filter(id => id !== sourceId)
      } else {
        return [...prev, sourceId]
      }
    })
  }

  const allSources = [
    { id: 'krebsonsecurity', name: 'Krebs on Security', type: 'RSS' },
    { id: 'bleepingcomputer', name: 'BleepingComputer', type: 'RSS' },
    { id: 'darkreading', name: 'Dark Reading', type: 'RSS' },
    { id: 'thehackernews', name: 'The Hacker News', type: 'RSS' },
    { id: 'securityweek', name: 'SecurityWeek', type: 'RSS' },
    { id: 'therecord', name: 'The Record', type: 'RSS', isNew: true },
    { id: 'arstechnica', name: 'Ars Technica Security', type: 'RSS', isNew: true },
    { id: 'wired', name: 'Wired Security', type: 'RSS', isNew: true },
    { id: 'reddit', name: 'r/netsec', type: 'Reddit' },
  ]

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear all cached data?')) {
      onClearCache()
      alert('Cache cleared successfully!')
    }
  }

  const cacheSize = () => {
    const articles = localStorage.getItem('hri_articles')
    if (!articles) return '0 KB'
    const bytes = new Blob([articles]).size
    return `${(bytes / 1024).toFixed(2)} KB`
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings & Configuration</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="settings-content">
          <section className="settings-section">
            <h3>🔌 API Configuration</h3>
            <div className="info-box">
              <Info size={16} />
              <p>
                Configure your API Gateway endpoint to fetch live news. 
                The default endpoint is already set up for you.
              </p>
            </div>
            <div className="input-group">
              <label htmlFor="api-endpoint">API Endpoint URL</label>
              <input
                id="api-endpoint"
                type="text"
                value={tempEndpoint}
                onChange={(e) => setTempEndpoint(e.target.value)}
                placeholder="https://your-api-gateway-url.com/prod/news"
              />
              <button 
                className={`save-btn ${saved ? 'saved' : ''}`}
                onClick={handleSave}
              >
                <Save size={16} />
                {saved ? 'Saved!' : 'Save Endpoint'}
              </button>
            </div>
          </section>

          <section className="settings-section">
            <h3>📰 News Sources</h3>
            <p className="section-subtitle">
              {localEnabledSources.length} of {allSources.length} sources enabled - 
              Click to enable/disable sources
            </p>
            <div className="sources-list">
              {allSources.map(source => {
                const isEnabled = localEnabledSources.includes(source.id)
                return (
                  <div 
                    key={source.id}
                    className={`source-item ${isEnabled ? 'enabled' : 'disabled'}`}
                    onClick={() => toggleSource(source.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <input 
                      type="checkbox" 
                      checked={isEnabled}
                      onChange={() => {}}
                      className="source-checkbox"
                    />
                    <span className={`source-badge ${source.isNew ? 'new' : source.type === 'Reddit' ? 'community' : ''}`}>
                      {source.isNew ? 'NEW' : source.type}
                    </span>
                    <span>{source.name}</span>
                  </div>
                )
              })}
            </div>
            <div className="source-actions">
              <button 
                className="secondary-btn"
                onClick={() => setLocalEnabledSources(allSources.map(s => s.id))}
              >
                Enable All
              </button>
              <button 
                className="secondary-btn"
                onClick={() => setLocalEnabledSources([])}
              >
                Disable All
              </button>
              <button 
                className="secondary-btn"
                onClick={() => setShowDebug(!showDebug)}
              >
                {showDebug ? 'Hide' : 'Show'} Debug Info
              </button>
            </div>
            {showDebug && (
              <div className="debug-info">
                <h4>Actual Source Names in Articles:</h4>
                <ul>
                  {getActualSources().map(source => (
                    <li key={source}>{source}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="settings-section">
            <h3>🛡️ Privacy Settings</h3>
            <div className="info-box">
              <Info size={16} />
              <p>
                All data is stored locally in your browser. No personal information 
                is collected or transmitted to external servers except for fetching news.
              </p>
            </div>
          </section>

          <section className="settings-section">
            <h3>💾 Data Management</h3>
            <div className="data-info">
              <p>Cache Size: <strong>{cacheSize()}</strong></p>
              <button className="danger-btn" onClick={handleClearCache}>
                <Trash2 size={16} />
                Clear Cache
              </button>
            </div>
          </section>

          <section className="settings-section">
            <h3>ℹ️ About</h3>
            <div className="about-info">
              <p><strong>Frontend Version:</strong> 3.0.0 + Phase 1</p>
              <p><strong>Lambda Version:</strong> 2.1.0</p>
              <p><strong>Runtime:</strong> React 18 + Vite 5</p>
              <p><strong>Total Sources:</strong> 9 (8 RSS + 1 Reddit)</p>
              <p>
                Human Risk Intelligence provides real-time cybersecurity news 
                aggregation from trusted sources with enhanced performance and reliability.
              </p>
              <p className="phase-info">
                <strong>Latest Updates:</strong> Added search, sort, read tracking, 
                infinite scroll, error boundaries, and 3 new premium sources.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Settings
