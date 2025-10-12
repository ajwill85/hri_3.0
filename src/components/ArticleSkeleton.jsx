function ArticleSkeleton() {
  return (
    <div className="article-card skeleton">
      <div className="skeleton-header">
        <div className="skeleton-line skeleton-source"></div>
        <div className="skeleton-line skeleton-date"></div>
      </div>
      <div className="skeleton-title">
        <div className="skeleton-line"></div>
        <div className="skeleton-line" style={{ width: '80%' }}></div>
      </div>
      <div className="skeleton-description">
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line" style={{ width: '60%' }}></div>
      </div>
      <div className="skeleton-footer">
        <div className="skeleton-line skeleton-tag"></div>
        <div className="skeleton-line skeleton-tag"></div>
      </div>
    </div>
  )
}

function ArticleSkeletonGrid({ count = 6 }) {
  return (
    <div className="articles-grid">
      {Array.from({ length: count }).map((_, index) => (
        <ArticleSkeleton key={index} />
      ))}
    </div>
  )
}

export { ArticleSkeleton, ArticleSkeletonGrid }
export default ArticleSkeletonGrid
