import { Filter } from 'lucide-react'

function NewsFilter({ selectedTopics, onTopicChange }) {
  const topics = [
    // Tier 1: Core Security - using common keywords
    { id: 'ai', label: 'AI Security', icon: '🤖', keywords: ['ai', 'artificial intelligence', 'machine learning', 'chatgpt', 'llm'] },
    { id: 'cloud', label: 'Cloud Security', icon: '☁️', keywords: ['cloud', 'aws', 'azure', 'gcp', 'saas'] },
    { id: 'ransomware', label: 'Ransomware', icon: '🔐', keywords: ['ransomware', 'ransom', 'encryption', 'lockbit', 'blackcat'] },
    { id: 'breach', label: 'Data Breach', icon: '💥', keywords: ['breach', 'leak', 'exposed', 'stolen data', 'compromised'] },
    { id: 'vulnerability', label: 'Vulnerabilities', icon: '⚠️', keywords: ['vulnerability', 'vuln', 'cve', 'exploit', 'patch'] },
    { id: 'zero-day', label: 'Zero-Day Exploits', icon: '⚡', keywords: ['zero-day', 'zero day', '0-day', 'unpatched'] },
    
    // Tier 2: Attack Vectors
    { id: 'phishing', label: 'Phishing & Email Threats', icon: '🎣', keywords: ['phishing', 'email', 'spear-phishing', 'bec', 'spam'] },
    { id: 'social-engineering', label: 'Social Engineering', icon: '🎭', keywords: ['social engineering', 'pretexting', 'manipulation', 'scam'] },
    { id: 'insider', label: 'Insider Threats', icon: '👤', keywords: ['insider', 'employee', 'internal threat', 'privileged access'] },
    
    // Tier 3: Technical Domains
    { id: 'identity', label: 'Identity & Access Management', icon: '🔐', keywords: ['identity', 'authentication', 'mfa', 'password', 'access', 'iam', 'sso'] },
    { id: 'application', label: 'Application Security', icon: '💻', keywords: ['application', 'app', 'software', 'code', 'devsecops', 'api'] },
    { id: 'endpoint', label: 'Endpoint Security', icon: '🖥️', keywords: ['endpoint', 'device', 'mobile', 'laptop', 'workstation', 'edr'] },
    { id: 'network', label: 'Infrastructure Security', icon: '🌐', keywords: ['network', 'infrastructure', 'firewall', 'router', 'server', 'dns'] },
    
    // Tier 4: Governance
    { id: 'privacy', label: 'Privacy & Compliance', icon: '🔒', keywords: ['privacy', 'gdpr', 'compliance', 'regulation', 'hipaa', 'pci', 'data protection', 'personal data', 'consent', 'ccpa', 'dpo', 'audit', 'policy', 'legal', 'law', 'fine', 'penalty'] },
    { id: 'threat', label: 'Threat Intelligence', icon: '🔍', keywords: ['threat', 'apt', 'actor', 'intelligence', 'ioc', 'ttp'] },
  ]

  const toggleTopic = (topicId) => {
    if (selectedTopics.includes(topicId)) {
      onTopicChange(selectedTopics.filter(t => t !== topicId))
    } else {
      onTopicChange([...selectedTopics, topicId])
    }
  }

  const showAllTopics = () => {
    onTopicChange([])
  }

  const isAllSelected = selectedTopics.length === 0

  return (
    <section className="news-filter" id="filter">
      <div className="container">
        <div className="filter-header">
          <div className="filter-title">
            <Filter size={20} />
            <h2>Filter by Topic</h2>
          </div>
          {selectedTopics.length > 0 && (
            <span className="filter-count">{selectedTopics.length} selected</span>
          )}
        </div>

        <div className="filter-topics">
          <button
            className={`topic-btn all-btn ${isAllSelected ? 'active' : ''}`}
            onClick={showAllTopics}
          >
            <span className="topic-icon">📰</span>
            <span className="topic-label">All</span>
          </button>
          
          {topics.map(topic => (
            <button
              key={topic.id}
              className={`topic-btn ${selectedTopics.includes(topic.id) ? 'active' : ''}`}
              onClick={() => toggleTopic(topic.id)}
            >
              <span className="topic-icon">{topic.icon}</span>
              <span className="topic-label">{topic.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default NewsFilter
