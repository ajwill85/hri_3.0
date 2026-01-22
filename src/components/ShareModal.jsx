import { useState, useEffect } from 'react'
import { X, Copy, Check, Linkedin, Twitter, Mail, Share2 } from 'lucide-react'

function ShareModal({ article, onClose, shortenerApiEndpoint }) {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    createShortLink()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article])

  const createShortLink = async () => {
    setLoading(true)
    setError(null)

    const articleData = {
      title: article.title || 'Untitled Article',
      description: article.description || '',
      source: article.source || 'Unknown Source',
      url: article.link || article.url || '',
      link: article.link || article.url || '',
      pubDate: article.pubDate || new Date().toISOString(),
      categories: article.categories || article.category || []
    }

    const baseUrl = window.location.origin

    // Try to create short link via API
    if (shortenerApiEndpoint) {
      try {
        const response = await fetch(shortenerApiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(articleData)
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.shortCode) {
            setShareUrl(`${baseUrl}/s/${data.shortCode}`)
            setLoading(false)
            return
          }
        }

        console.warn('Short link API failed, falling back to base64')
      } catch (err) {
        console.error('Error creating short link:', err)
        setError('Failed to create short link, using fallback')
      }
    }

    // Fallback to base64 encoding
    const encodedData = btoa(JSON.stringify(articleData))
    const url = `${baseUrl}?share=${encodedData}`
    setShareUrl(url)
    setLoading(false)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=600,height=600')
  }

  const shareToTwitter = () => {
    const text = `${article.title} - via Human Risk Intelligence`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=600,height=600')
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Cybersecurity News: ${article.title}`)
    const body = encodeURIComponent(`I thought you might find this interesting:\n\n${article.title}\n\n${shareUrl}\n\nShared via Human Risk Intelligence`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: `${article.title} - via Human Risk Intelligence`,
          url: shareUrl
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="share-modal">
        <div className="modal-header">
          <h3>Share Article</h3>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="share-article-preview">
            <h4>{article.title}</h4>
            {article.source && <p className="share-source">Source: {article.source}</p>}
          </div>

          <div className="share-url-section">
            <label>Share Link</label>
            {loading ? (
              <div className="share-url-loading">
                <p>Generating short link...</p>
              </div>
            ) : (
              <>
                <div className="share-url-input">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    className={`copy-button ${copied ? 'copied' : ''}`}
                    onClick={copyToClipboard}
                    disabled={loading}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                {error && <p className="share-error">{error}</p>}
              </>
            )}
          </div>

          <div className="share-options">
            <p className="share-options-label">Share via:</p>
            <div className="share-buttons-grid">
              <button className="share-option-button linkedin" onClick={shareToLinkedIn}>
                <Linkedin size={20} />
                <span>LinkedIn</span>
              </button>

              <button className="share-option-button twitter" onClick={shareToTwitter}>
                <Twitter size={20} />
                <span>Twitter</span>
              </button>

              <button className="share-option-button email" onClick={shareViaEmail}>
                <Mail size={20} />
                <span>Email</span>
              </button>

              {navigator.share && (
                <button className="share-option-button native" onClick={shareNative}>
                  <Share2 size={20} />
                  <span>More...</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareModal
