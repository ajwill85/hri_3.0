import { useState } from 'react'
import { Share2 } from 'lucide-react'

function ShareButton({ article, onShare }) {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onShare(article)
  }

  return (
    <div className="share-button-wrapper">
      <button
        className="share-button"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title="Share article"
        aria-label="Share article"
      >
        <Share2 size={16} />
      </button>
      {showTooltip && <span className="share-tooltip">Share</span>}
    </div>
  )
}

export default ShareButton
