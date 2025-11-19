import { useEffect, useState } from 'react'
import { ExternalLink, Home, Calendar, Tag } from 'lucide-react'

function ShareView({ shareData, onBackToHome }) {
  const [article, setArticle] = useState(null)

  useEffect(() => {
    if (shareData) {
      try {
        const decoded = JSON.parse(atob(shareData))
        setArticle(decoded)
        
        // Update page title and meta tags
        document.title = `${decoded.title} - Human Risk Intelligence`
        
        // Update Open Graph meta tags
        const updateMetaTag = (property, content) => {
          let meta = document.querySelector(`meta[property="${property}"]`)
          if (!meta) {
            meta = document.querySelector(`meta[name="${property}"]`)
          }
          if (meta) {
            meta.setAttribute('content', content)
          }
        }
        
        updateMetaTag('og:title', decoded.title)
        updateMetaTag('og:description', decoded.description || decoded.title)
        updateMetaTag('og:url', window.location.href)
        updateMetaTag('twitter:title', decoded.title)
        updateMetaTag('twitter:description', decoded.description || decoded.title)
        updateMetaTag('description', decoded.description || decoded.title)
      } catch (error) {
        console.error('Failed to parse share data:', error)
      }
    }
  }, [shareData])

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    } catch {
      return 'Unknown date'
    }
  }

  if (!article) {
    return (
      <div className="share-view-container">
        <div className="share-view-error">
          <h2>Article Not Found</h2>
          <p>The article you're looking for couldn't be loaded.</p>
          <button className="btn-primary" onClick={onBackToHome}>
            <Home size={18} />
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="share-view-container">
      <div className="share-view-header">
        <div className="share-view-branding">
          <h1>🛡️ Human Risk Intelligence</h1>
          <p>Cybersecurity News & Intelligence v3.0</p>
        </div>
        <button className="btn-secondary" onClick={onBackToHome}>
          <Home size={18} />
          Browse More News
        </button>
      </div>

      <article className="share-view-article">
        <div className="share-view-meta">
          {article.source && (
            <span className="share-view-source">{article.source}</span>
          )}
          {article.pubDate && (
            <span className="share-view-date">
              <Calendar size={16} />
              {formatDate(article.pubDate)}
            </span>
          )}
        </div>

        <h2 className="share-view-title">{article.title}</h2>

        {article.description && (
          <div className="share-view-description">
            <p>{article.description}</p>
          </div>
        )}

        {(article.categories || article.category) && (
          <div className="share-view-categories">
            <Tag size={16} />
            <div className="category-tags">
              {Array.isArray(article.categories) 
                ? article.categories.map((cat, i) => (
                    <span key={i} className="category-tag">{cat}</span>
                  ))
                : <span className="category-tag">{article.category}</span>
              }
            </div>
          </div>
        )}

        <div className="share-view-security-note">
          <strong>🔒 Security Tip:</strong> Always verify the source of cybersecurity information and check multiple trusted sources before taking action.
        </div>

        <div className="share-view-actions">
          {(article.url || article.link) ? (
            <a 
              href={article.url || article.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <ExternalLink size={18} />
              Read Full Article
            </a>
          ) : (
            <div className="share-view-security-note" style={{ marginBottom: 0 }}>
              <strong>⚠️ Note:</strong> The original article link is not available in this share. Please browse our news feed to find the full article.
            </div>
          )}
          <button className="btn-secondary" onClick={onBackToHome}>
            <Home size={18} />
            Browse More News
          </button>
        </div>
      </article>

      <footer className="share-view-footer">
        <p><strong>Human Risk Intelligence v3.0</strong></p>
        <p>Stay informed about the latest cybersecurity threats and protection strategies</p>
      </footer>
    </div>
  )
}

export default ShareView
