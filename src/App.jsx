import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import NewsFilter from './components/NewsFilter'
import SearchBar from './components/SearchBar'
import SortBar from './components/SortBar'
import NewsFeed from './components/NewsFeed'
import Settings from './components/Settings'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

// Topic keywords for enhanced filtering
const TOPIC_KEYWORDS = {
  'ai': ['ai', 'artificial intelligence', 'machine learning', 'chatgpt', 'llm'],
  'cloud': ['cloud', 'aws', 'azure', 'gcp', 'saas'],
  'ransomware': ['ransomware', 'ransom', 'encryption', 'lockbit', 'blackcat'],
  'breach': ['breach', 'leak', 'exposed', 'stolen data', 'compromised'],
  'vulnerability': ['vulnerability', 'vuln', 'cve', 'exploit', 'patch'],
  'zero-day': ['zero-day', 'zero day', '0-day', 'unpatched'],
  'phishing': ['phishing', 'email', 'spear-phishing', 'bec', 'spam'],
  'social-engineering': ['social engineering', 'pretexting', 'manipulation', 'scam'],
  'insider': ['insider', 'employee', 'internal threat', 'privileged access'],
  'identity': ['identity', 'authentication', 'mfa', 'password', 'access', 'iam', 'sso'],
  'application': ['application', 'app', 'software', 'code', 'devsecops', 'api'],
  'endpoint': ['endpoint', 'device', 'mobile', 'laptop', 'workstation', 'edr'],
  'network': ['network', 'infrastructure', 'firewall', 'router', 'server', 'dns'],
  'privacy': ['privacy', 'gdpr', 'compliance', 'regulation', 'hipaa', 'pci', 'data protection', 'personal data', 'consent', 'ccpa', 'dpo', 'audit', 'policy', 'legal', 'law', 'fine', 'penalty'],
  'threat': ['threat', 'apt', 'actor', 'intelligence', 'ioc', 'ttp'],
}

function App() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedTopics, setSelectedTopics] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  const [readArticles, setReadArticles] = useState(new Set())
  const [enabledSources, setEnabledSources] = useState([
    'krebsonsecurity', 'bleepingcomputer', 'darkreading', 'thehackernews', 
    'securityweek', 'therecord', 'arstechnica', 'wired', 'reddit'
  ])
  const [apiEndpoint, setApiEndpoint] = useState(
    'https://e1suks3vz6.execute-api.us-east-2.amazonaws.com/prod/news'
  )
  const [showSettings, setShowSettings] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  // Load cached data and preferences
  useEffect(() => {
    const cached = localStorage.getItem('hri_articles')
    const cachedTime = localStorage.getItem('hri_last_refresh')
    const savedEndpoint = localStorage.getItem('hri_api_endpoint')
    const savedTopics = localStorage.getItem('hri_selected_topics')
    const savedReadArticles = localStorage.getItem('hri_read_articles')
    const savedSortBy = localStorage.getItem('hri_sort_by')
    const savedSources = localStorage.getItem('hri_enabled_sources')

    if (cached) {
      try {
        setArticles(JSON.parse(cached))
      } catch (e) {
        console.error('Failed to parse cached articles:', e)
      }
    }

    if (cachedTime) {
      setLastRefresh(new Date(cachedTime))
    }

    if (savedEndpoint) {
      setApiEndpoint(savedEndpoint)
    }

    if (savedTopics) {
      try {
        setSelectedTopics(JSON.parse(savedTopics))
      } catch (e) {
        console.error('Failed to parse saved topics:', e)
      }
    }

    if (savedReadArticles) {
      try {
        setReadArticles(new Set(JSON.parse(savedReadArticles)))
      } catch (e) {
        console.error('Failed to parse read articles:', e)
      }
    }

    if (savedSortBy) {
      setSortBy(savedSortBy)
    }

    if (savedSources) {
      try {
        setEnabledSources(JSON.parse(savedSources))
      } catch (e) {
        console.error('Failed to parse saved sources:', e)
      }
    }
  }, [])

  // Fetch news from API
  const fetchNews = async () => {
    if (!apiEndpoint) {
      setError('Please configure your API endpoint in settings')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(apiEndpoint)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      const newsArticles = Array.isArray(data) ? data : data.articles || []
      setArticles(newsArticles)
      
      // Cache the results
      localStorage.setItem('hri_articles', JSON.stringify(newsArticles))
      const now = new Date()
      localStorage.setItem('hri_last_refresh', now.toISOString())
      setLastRefresh(now)
    } catch (err) {
      console.error('Failed to fetch news:', err)
      setError(`Failed to fetch news: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch on mount if we have an endpoint
  useEffect(() => {
    if (apiEndpoint && articles.length === 0) {
      fetchNews()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save preferences
  useEffect(() => {
    localStorage.setItem('hri_api_endpoint', apiEndpoint)
  }, [apiEndpoint])

  useEffect(() => {
    localStorage.setItem('hri_selected_topics', JSON.stringify(selectedTopics))
  }, [selectedTopics])

  useEffect(() => {
    localStorage.setItem('hri_read_articles', JSON.stringify(Array.from(readArticles)))
  }, [readArticles])

  useEffect(() => {
    localStorage.setItem('hri_sort_by', sortBy)
  }, [sortBy])

  useEffect(() => {
    localStorage.setItem('hri_enabled_sources', JSON.stringify(enabledSources))
  }, [enabledSources])

  // Mark article as read
  const markAsRead = (articleLink) => {
    setReadArticles(prev => new Set([...prev, articleLink]))
  }

  // Source name mapping for filtering - maps source IDs to possible source name variations
  const sourcePatterns = {
    'krebsonsecurity': ['krebs', 'krebsonsecurity'],
    'bleepingcomputer': ['bleeping', 'bleepingcomputer'],
    'darkreading': ['dark reading', 'darkreading'],
    'thehackernews': ['hacker news', 'hackernews', 'thehackernews'],
    'securityweek': ['securityweek', 'security week'],
    'therecord': ['the record', 'therecord', 'recorded future'],
    'arstechnica': ['ars technica', 'arstechnica', 'security – ars technica'],
    'wired': ['wired', 'security latest'], // Wired feed title is "Security Latest"
    'reddit': ['reddit', 'netsec', 'r/netsec']
  }

  // Filter, search, and sort articles
  const processedArticles = () => {
    let result = articles

    // Filter by enabled sources
    if (enabledSources.length < 9) {
      result = result.filter(article => {
        const source = (article.source || '').toLowerCase()
        
        // Check if source matches any enabled source pattern
        for (const sourceId of enabledSources) {
          const patterns = sourcePatterns[sourceId] || [sourceId]
          if (patterns.some(pattern => source.includes(pattern.toLowerCase()))) {
            return true
          }
        }
        
        return false
      })
    }

    // Filter by topics using keyword matching
    if (selectedTopics.length > 0) {
      result = result.filter(article => {
        // Combine all searchable text from the article
        const searchableText = [
          article.title || '',
          article.description || '',
          article.content || '',
          ...(Array.isArray(article.categories) ? article.categories : []),
          article.category || '',
          ...(Array.isArray(article.tags) ? article.tags : []),
          article.topic || '',
        ].join(' ').toLowerCase()
        
        // Check if any selected topic's keywords match the article content
        return selectedTopics.some(topicId => {
          const keywords = TOPIC_KEYWORDS[topicId] || [topicId]
          return keywords.some(keyword => 
            searchableText.includes(keyword.toLowerCase())
          )
        })
      })
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(article =>
        article.title?.toLowerCase().includes(query) ||
        article.description?.toLowerCase().includes(query)
      )
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.pubDate || 0) - new Date(a.pubDate || 0)
        case 'date-asc':
          return new Date(a.pubDate || 0) - new Date(b.pubDate || 0)
        case 'source':
          return (a.source || '').localeCompare(b.source || '')
        case 'title':
          return (a.title || '').localeCompare(b.title || '')
        default:
          return 0
      }
    })

    return result
  }

  const filteredArticles = processedArticles()

  return (
    <ErrorBoundary>
      <div className="app">
        <Header onSettingsClick={() => setShowSettings(true)} />
        <Hero 
          articleCount={filteredArticles.length}
          lastRefresh={lastRefresh}
          onRefresh={fetchNews}
          loading={loading}
        />
        <div className="container search-sort-container">
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <SortBar 
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>
        <NewsFilter 
          selectedTopics={selectedTopics}
          onTopicChange={setSelectedTopics}
          totalArticles={articles.length}
        />
        <NewsFeed 
          articles={filteredArticles}
          loading={loading}
          error={error}
          readArticles={readArticles}
          onMarkAsRead={markAsRead}
        />
        {showSettings && (
          <Settings
            apiEndpoint={apiEndpoint}
            onApiEndpointChange={setApiEndpoint}
            enabledSources={enabledSources}
            onSourcesChange={setEnabledSources}
            articles={articles}
            onClose={() => setShowSettings(false)}
            onClearCache={() => {
              localStorage.removeItem('hri_articles')
              localStorage.removeItem('hri_last_refresh')
              localStorage.removeItem('hri_read_articles')
              setArticles([])
              setLastRefresh(null)
              setReadArticles(new Set())
            }}
          />
        )}
        <Footer />
      </div>
    </ErrorBoundary>
  )
}

export default App
