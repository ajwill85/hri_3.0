// Lambda Function: Human Risk Intelligence News Aggregator v2.2
// Deploy this to AWS Lambda with Node.js 24.x runtime
// Version: 2.2.0 - Updated to Node.js 24.x LTS

const https = require('https');
const Parser = require('rss-parser');

// RSS Feed Sources
const RSS_FEEDS = {
    // Original sources
    krebsonsecurity: 'https://krebsonsecurity.com/feed/',
    bleepingcomputer: 'https://www.bleepingcomputer.com/feed/',
    darkreading: 'https://www.darkreading.com/rss.xml',
    thehackernews: 'https://feeds.feedburner.com/TheHackersNews',
    securityweek: 'https://www.securityweek.com/feed',
    
    // Phase 1 additions
    therecord: 'https://therecord.media/feed/',
    arstechnica: 'https://arstechnica.com/security/feed/',
    wired: 'https://www.wired.com/feed/category/security/latest/rss'
};

// Topic categorization
const TOPIC_KEYWORDS = {
    'Password Security': ['password', 'authentication', '2fa', 'mfa', 'credential', 'login'],
    'Social Engineering': ['phishing', 'scam', 'fraud', 'social engineering', 'impersonation'],
    'Mobile Security': ['mobile', 'android', 'ios', 'smartphone', 'app security'],
    'Financial Security': ['banking', 'financial', 'payment', 'credit card', 'cryptocurrency'],
    'Privacy': ['privacy', 'data protection', 'gdpr', 'surveillance', 'tracking', 'CCPA', 'HIPAA','data minimization', 'DSAR', 'DPIA'],
    'Email Security': ['email', 'spam', 'business email compromise', 'bec'],
    'Network Security': ['network', 'firewall', 'router', 'wifi', 'vpn', 'ddos'],
    'Updates': ['update', 'patch', 'vulnerability', 'cve', 'security fix'],
    'Vulnerabilities': ['vulnerability', 'exploit', 'buffer overflow', 'sql injection'],
    'Data Breach': ['breach', 'leak', 'exposed', 'compromised', 'stolen data'],
    'AI Security': ['artificial intelligence', 'ai', 'machine learning', 'ml', 'deepfake', 'nlp', 'ai threat', 'ai security', 'ai ethics', 'ai governance', 'large language model', 'llm', 'chatgpt', 'claude', 'prompt injection', 'ai bias','algorithmic', 'neural network', 'ai safety', 'ai alignment', 'automated', 'bot detection', 'adversarial', 'model poisoning', 'data poisoning', 'ai privacy', 'synthetic media', 'generative ai'],
    'Cloud Security': ['cloud', 'aws', 'azure', 'gcp', 'cloud security'],
};

function categorizeArticle(title, summary = '') {
    const content = `${title} ${summary}`.toLowerCase();
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        if (keywords.some(keyword => content.includes(keyword.toLowerCase()))) {
            return topic;
        }
    }
    return 'General Security';
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
}

function cleanHTML(html) {
    if (!html) return '';
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters to prevent encoding issues
        .trim();
}

async function fetchRSSFeeds() {
    const parser = new Parser({
        timeout: 8000,
        headers: {
            'User-Agent': 'HumanRiskIntelligence/2.0'
        }
    });
    
    const allArticles = [];
    const feedPromises = [];
    
    for (const [source, url] of Object.entries(RSS_FEEDS)) {
        feedPromises.push(
            Promise.race([
                parser.parseURL(url),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), 8000)
                )
            ])
            .then(feed => {
                console.log(`Successfully fetched ${source}: ${feed.items.length} items`);
                return feed.items.slice(0, 8).map((item, index) => ({
                    id: `${source}-${Date.now()}-${index}`,
                    title: cleanText(item.title || 'Security News Update'),
                    summary: cleanHTML(item.contentSnippet || item.content || item.summary || 'Security news update from ' + source).substring(0, 250),
                    url: item.link || item.guid || '#',
                    source: feed.title || source,
                    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
                    topic: categorizeArticle(item.title || '', item.contentSnippet || ''),
                    timeAgo: getTimeAgo(item.pubDate || new Date())
                }));
            })
            .catch(error => {
                console.error(`Error fetching ${source}: ${error.message}`);
                return [];
            })
        );
    }
    
    const results = await Promise.allSettled(feedPromises);
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            allArticles.push(...result.value);
        }
    });
    
    return allArticles;
}

async function fetchRedditPosts() {
    return new Promise((resolve) => {
        const options = {
            hostname: 'www.reddit.com',
            path: '/r/netsec/hot.json?limit=10',
            method: 'GET',
            headers: {
                'User-Agent': 'AWS:HumanRiskIntelligence:v2.0.0'
            },
            timeout: 5000
        };

        const req = https.get(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (!json.data || !json.data.children) {
                        resolve([]);
                        return;
                    }
                    
                    const articles = json.data.children
                        .filter(post => !post.data.stickied && !post.data.is_self)
                        .slice(0, 5)
                        .map((post, index) => ({
                            id: `reddit-${post.data.id}`,
                            title: cleanText(post.data.title),
                            summary: cleanText(`Reddit discussion with ${post.data.score} upvotes. ${post.data.num_comments} comments.`),
                            url: post.data.url,
                            source: 'Reddit r/netsec',
                            publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
                            topic: categorizeArticle(post.data.title),
                            timeAgo: getTimeAgo(new Date(post.data.created_utc * 1000))
                        }));
                    resolve(articles);
                } catch (error) {
                    console.error('Reddit parse error:', error.message);
                    resolve([]);
                }
            });
        });
        
        req.on('error', () => resolve([]));
        req.on('timeout', () => {
            req.destroy();
            resolve([]);
        });
        req.setTimeout(5000);
    });
}

exports.handler = async (event) => {
    console.log('Lambda invoked for real news aggregation');
    
    const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Requested-With,cache-control,accept,content-type,origin',
        'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
        'Access-Control-Max-Age': '86400'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }
    
    try {
        const startTime = Date.now();
        
        console.log('Fetching from RSS feeds and Reddit...');
        const [rssArticles, redditArticles] = await Promise.all([
            fetchRSSFeeds(),
            fetchRedditPosts()
        ]);
        
        let allArticles = [...rssArticles, ...redditArticles];
        console.log(`Fetched ${allArticles.length} total articles`);
        
        // Remove duplicates and sort
        const uniqueArticles = [];
        const seenTitles = new Set();
        
        for (const article of allArticles) {
            const normalizedTitle = article.title.toLowerCase()
                .replace(/[^a-z0-9]/g, '')
                .substring(0, 100);
            
            if (!seenTitles.has(normalizedTitle)) {
                seenTitles.add(normalizedTitle);
                uniqueArticles.push(article);
            }
        }
        
        uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        const topArticles = uniqueArticles.slice(0, 50);
        
        const executionTime = Date.now() - startTime;
        console.log(`Processed ${topArticles.length} unique articles in ${executionTime}ms`);
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                count: topArticles.length,
                articles: topArticles,
                sources: {
                    rss: rssArticles.length,
                    reddit: redditArticles.length,
                    hackerNews: 0
                },
                executionTime,
                timestamp: new Date().toISOString(),
                version: '2.2.0'
            })
        };
        
    } catch (error) {
        console.error('Handler error:', error);
        
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch news articles',
                message: error.message,
                timestamp: new Date().toISOString(),
                version: '2.2.0'
            })
        };
    }
};
