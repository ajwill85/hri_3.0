import { useState, useEffect, useRef, useCallback } from 'react'
import { ExternalLink, Calendar, Tag, AlertCircle, CheckCircle } from 'lucide-react'
import ArticleSkeletonGrid from './ArticleSkeleton'
import ShareButton from './ShareButton'

function NewsFeed({ articles, loading, error, readArticles, onMarkAsRead, onShare }) {
  const [visibleArticles, setVisibleArticles] = useState(20)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)
  const loadMoreRef = useRef(null)

  useEffect(() => {
    const currentRef = sectionRef.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  // Infinite scroll observer
  const loadMore = useCallback(() => {
    if (visibleArticles < articles.length) {
      setVisibleArticles(prev => Math.min(prev + 20, articles.length))
    }
  }, [visibleArticles, articles.length])

  useEffect(() => {
    const currentLoadMoreRef = loadMoreRef.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) {
          loadMore()
        }
      },
      { threshold: 0.5 }
    )

    if (currentLoadMoreRef) {
      observer.observe(currentLoadMoreRef)
    }

    return () => {
      if (currentLoadMoreRef) {
        observer.unobserve(currentLoadMoreRef)
      }
    }
  }, [loadMore, loading])

  // Reset visible articles when articles change
  useEffect(() => {
    setVisibleArticles(20)
  }, [articles.length])

  const handleArticleClick = (articleLink) => {
    onMarkAsRead(articleLink)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    } catch {
      return 'Unknown date'
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'ai-security': '#8b5cf6',
      'cloud-security': '#3b82f6',
      'social-engineering': '#ec4899',
      'privacy': '#10b981',
      'malware': '#ef4444',
      'vulnerabilities': '#f59e0b',
      'data-breach': '#dc2626',
      'compliance': '#6366f1',
    }
    return colors[category] || '#6b7280'
  }

  if (error) {
    return (
      <section className="news-feed error" id="news">
        <div className="container">
          <div className="error-message">
            <AlertCircle size={48} />
            <h3>Failed to Load News</h3>
            <p>{error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (loading && articles.length === 0) {
    return (
      <section className="news-feed loading" id="news">
        <div className="container">
          <ArticleSkeletonGrid count={6} />
        </div>
      </section>
    )
  }

  return (
    <section 
      className={`news-feed ${isVisible ? 'visible' : ''}`} 
      id="news"
      ref={sectionRef}
    >
      <div className="container">
        <div className="feed-header">
          <h2>Latest News</h2>
          <p className="feed-count">
            Showing {Math.min(visibleArticles, articles.length)} of {articles.length} articles
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="no-articles">
            <AlertCircle size={48} />
            <h3>No Articles Found</h3>
            <p>Try adjusting your filters or refresh the news feed</p>
          </div>
        ) : (
          <>
            <div className="articles-grid">
              {articles.slice(0, visibleArticles).map((article, index) => {
                const isRead = readArticles.has(article.link)
                return (
                  <article 
                    key={`${article.link}-${index}`} 
                    className={`article-card ${isRead ? 'read' : ''}`}
                    style={{ animationDelay: `${(index % 20) * 0.05}s` }}
                  >
                    <div className="article-header">
                      {article.source && (
                        <span className="article-source">{article.source}</span>
                      )}
                      {article.pubDate && (
                        <span className="article-date">
                          <Calendar size={14} />
                          {formatDate(article.pubDate)}
                        </span>
                      )}
                      <div className="article-header-actions">
                        {isRead && (
                          <span className="read-indicator" title="Read">
                            <CheckCircle size={16} />
                          </span>
                        )}
                        {onShare && <ShareButton article={article} onShare={onShare} />}
                      </div>
                    </div>

                    <h3 className="article-title">
                      <a 
                        href={article.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => handleArticleClick(article.link)}
                      >
                        {article.title}
                      </a>
                    </h3>

                  {article.description && (
                    <p className="article-description">
                      {article.description.substring(0, 150)}
                      {article.description.length > 150 ? '...' : ''}
                    </p>
                  )}

                  <div className="article-footer">
                    {(article.categories || article.category) && (
                      <div className="article-categories">
                        <Tag size={14} />
                        {Array.isArray(article.categories) 
                          ? article.categories.slice(0, 2).map((cat, i) => (
                              <span 
                                key={i} 
                                className="category-tag"
                                style={{ backgroundColor: getCategoryColor(cat) }}
                              >
                                {cat}
                              </span>
                            ))
                          : <span 
                              className="category-tag"
                              style={{ backgroundColor: getCategoryColor(article.category) }}
                            >
                              {article.category}
                            </span>
                        }
                      </div>
                    )}
                    <a 
                      href={article.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="read-more"
                      onClick={() => handleArticleClick(article.link)}
                    >
                      Read More
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </article>
                )
              })}
            </div>

            {visibleArticles < articles.length && (
              <div className="load-more-sentinel" ref={loadMoreRef}>
                <div className="loading-more">
                  <div className="spinner-small"></div>
                  <span>Loading more articles...</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default NewsFeed
