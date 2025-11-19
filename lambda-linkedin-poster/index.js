// Lambda Function: LinkedIn Auto-Poster for Human Risk Intelligence
// Posts 3 articles daily from AI Security, Cloud Security, and Privacy categories
// Version: 1.0.0

const https = require('https');

// Configuration
const CONFIG = {
  HRI_API_ENDPOINT: 'https://e1suks3vz6.execute-api.us-east-2.amazonaws.com/prod/news',
  LINKEDIN_API_VERSION: '202401',
  LINKEDIN_ORG_ID: 'urn:li:organization:106373030', // Will need to verify this
  TARGET_CATEGORIES: ['AI Security', 'Cloud Security', 'Privacy'],
  POSTS_PER_DAY: 3,
  POSTED_ARTICLES_TABLE: 'hri-posted-articles', // DynamoDB table name
};

// LinkedIn API helper
async function makeLinkedInRequest(path, method, data, accessToken) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'api.linkedin.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': CONFIG.LINKEDIN_API_VERSION,
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(responseData || '{}'));
        } else {
          reject(new Error(`LinkedIn API error: ${res.statusCode} - ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// Fetch articles from HRI API
async function fetchArticles() {
  return new Promise((resolve, reject) => {
    https.get(CONFIG.HRI_API_ENDPOINT, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response.articles || []);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Check if article was already posted (DynamoDB)
async function isArticlePosted(articleUrl, dynamodb) {
  try {
    const { GetItemCommand } = require('@aws-sdk/client-dynamodb');
    const params = {
      TableName: CONFIG.POSTED_ARTICLES_TABLE,
      Key: { articleUrl: { S: articleUrl } }
    };
    
    const result = await dynamodb.send(new GetItemCommand(params));
    return !!result.Item;
  } catch (error) {
    console.error('Error checking posted status:', error);
    return false; // If table doesn't exist yet, assume not posted
  }
}

// Mark article as posted (DynamoDB)
async function markArticleAsPosted(article, dynamodb) {
  const { PutItemCommand } = require('@aws-sdk/client-dynamodb');
  const params = {
    TableName: CONFIG.POSTED_ARTICLES_TABLE,
    Item: {
      articleUrl: { S: article.url },
      title: { S: article.title },
      category: { S: article.topic || 'Unknown' },
      postedAt: { S: new Date().toISOString() },
      source: { S: article.source || 'Unknown' }
    }
  };
  
  try {
    await dynamodb.send(new PutItemCommand(params));
  } catch (error) {
    console.error('Error marking article as posted:', error);
  }
}

// Select articles to post
async function selectArticlesToPost(articles, dynamodb) {
  // Filter by target categories
  const categoryArticles = articles.filter(article => 
    CONFIG.TARGET_CATEGORIES.includes(article.topic)
  );

  console.log(`Found ${categoryArticles.length} articles in target categories`);

  // Filter out already posted articles
  const unpostedArticles = [];
  for (const article of categoryArticles) {
    const posted = await isArticlePosted(article.url, dynamodb);
    if (!posted) {
      unpostedArticles.push(article);
    }
  }

  console.log(`${unpostedArticles.length} articles not yet posted`);

  // Sort by publication date (newest first)
  unpostedArticles.sort((a, b) => {
    const dateA = new Date(a.publishedAt || 0);
    const dateB = new Date(b.publishedAt || 0);
    return dateB - dateA;
  });

  // Select one from each category if possible
  const selected = [];
  const categoriesUsed = new Set();

  // First pass: one per category
  for (const article of unpostedArticles) {
    if (selected.length >= CONFIG.POSTS_PER_DAY) break;
    if (!categoriesUsed.has(article.topic)) {
      selected.push(article);
      categoriesUsed.add(article.topic);
    }
  }

  // Second pass: fill remaining slots with any category
  for (const article of unpostedArticles) {
    if (selected.length >= CONFIG.POSTS_PER_DAY) break;
    if (!selected.includes(article)) {
      selected.push(article);
    }
  }

  return selected;
}

// Create LinkedIn post content
function createPostContent(article) {
  const emoji = {
    'AI Security': '🤖',
    'Cloud Security': '☁️',
    'Privacy': '🔒'
  }[article.topic] || '🛡️';

  const hashtags = [
    '#CyberSecurity',
    '#InfoSec',
    article.topic === 'AI Security' ? '#AISecurity' : null,
    article.topic === 'Cloud Security' ? '#CloudSecurity' : null,
    article.topic === 'Privacy' ? '#Privacy' : null,
    '#ThreatIntelligence'
  ].filter(Boolean).join(' ');

  const text = `${emoji} ${article.title}

${article.summary || article.description || ''}

Read more: ${article.url}

Source: ${article.source}

${hashtags}`;

  return text;
}

// Post to LinkedIn
async function postToLinkedIn(article, accessToken) {
  const postContent = createPostContent(article);

  const shareData = {
    author: CONFIG.LINKEDIN_ORG_ID,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: postContent
        },
        shareMediaCategory: 'ARTICLE',
        media: [
          {
            status: 'READY',
            originalUrl: article.url,
            title: {
              text: article.title
            },
            description: {
              text: article.summary || article.description || ''
            }
          }
        ]
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  };

  try {
    const result = await makeLinkedInRequest(
      '/v2/ugcPosts',
      'POST',
      shareData,
      accessToken
    );
    console.log('Successfully posted to LinkedIn:', article.title);
    return result;
  } catch (error) {
    console.error('Failed to post to LinkedIn:', error.message);
    throw error;
  }
}

// Main Lambda handler
exports.handler = async (event) => {
  console.log('Starting LinkedIn auto-poster...');

  // Get LinkedIn access token from environment variable
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!accessToken) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'LinkedIn access token not configured' })
    };
  }

  // Initialize DynamoDB client
  const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
  const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-2' });

  try {
    // Fetch articles
    console.log('Fetching articles from HRI API...');
    const articles = await fetchArticles();
    console.log(`Fetched ${articles.length} total articles`);

    // Select articles to post
    const articlesToPost = await selectArticlesToPost(articles, dynamodb);
    console.log(`Selected ${articlesToPost.length} articles to post`);

    if (articlesToPost.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'No new articles to post',
          categories: CONFIG.TARGET_CATEGORIES
        })
      };
    }

    // Post to LinkedIn
    const results = [];
    for (const article of articlesToPost) {
      try {
        await postToLinkedIn(article, accessToken);
        await markArticleAsPosted(article, dynamodb);
        results.push({
          success: true,
          title: article.title,
          category: article.topic
        });
        
        // Wait 2 seconds between posts to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        results.push({
          success: false,
          title: article.title,
          error: error.message
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'LinkedIn posting completed',
        posted: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results: results
      })
    };

  } catch (error) {
    console.error('Error in LinkedIn auto-poster:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      })
    };
  }
};
