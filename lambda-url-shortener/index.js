// Lambda Function: HRI URL Shortener
// Deploy this to AWS Lambda with Node.js 24.x runtime
// Version: 1.0.0

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutItemCommand, GetItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-2' });
const TABLE_NAME = process.env.TABLE_NAME || 'hri-short-links';
const BASE_URL = process.env.BASE_URL || 'https://humanriskintel.com';

// Generate random short code (6 characters, Base62)
function generateShortCode() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// Validate article data
function validateArticleData(data) {
    if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Article data must be an object' };
    }

    if (!data.title || typeof data.title !== 'string') {
        return { valid: false, error: 'Article title is required' };
    }

    if (!data.url && !data.link) {
        return { valid: false, error: 'Article URL is required' };
    }

    return { valid: true };
}

// Create short link
async function createShortLink(articleData) {
    const validation = validateArticleData(articleData);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Try up to 5 times to generate unique code
    let attempts = 0;
    let shortCode;

    while (attempts < 5) {
        shortCode = generateShortCode();

        try {
            // Check if code already exists
            const getParams = {
                TableName: TABLE_NAME,
                Key: {
                    shortCode: { S: shortCode }
                }
            };

            const existing = await dynamodb.send(new GetItemCommand(getParams));

            if (!existing.Item) {
                // Code is unique, use it
                break;
            }

            attempts++;
        } catch (error) {
            console.error('Error checking for existing code:', error);
            attempts++;
        }
    }

    if (attempts >= 5) {
        throw new Error('Failed to generate unique short code');
    }

    // Store in DynamoDB
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + (90 * 24 * 60 * 60); // 90 days from now

    const putParams = {
        TableName: TABLE_NAME,
        Item: {
            shortCode: { S: shortCode },
            articleData: { S: JSON.stringify(articleData) },
            createdAt: { N: now.toString() },
            expiresAt: { N: expiresAt.toString() },
            clicks: { N: '0' }
        }
    };

    await dynamodb.send(new PutItemCommand(putParams));

    return {
        shortCode,
        shortUrl: `${BASE_URL}/s/${shortCode}`,
        expiresAt
    };
}

// Retrieve article data by short code
async function getShortLink(shortCode) {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            shortCode: { S: shortCode }
        }
    };

    const result = await dynamodb.send(new GetItemCommand(params));

    if (!result.Item) {
        return null;
    }

    // Increment click counter (fire and forget)
    const updateParams = {
        TableName: TABLE_NAME,
        Key: {
            shortCode: { S: shortCode }
        },
        UpdateExpression: 'SET clicks = clicks + :inc, lastAccessed = :now',
        ExpressionAttributeValues: {
            ':inc': { N: '1' },
            ':now': { N: Math.floor(Date.now() / 1000).toString() }
        }
    };

    dynamodb.send(new UpdateItemCommand(updateParams)).catch(err => {
        console.error('Failed to update click count:', err);
    });

    return {
        articleData: JSON.parse(result.Item.articleData.S),
        createdAt: parseInt(result.Item.createdAt.N),
        clicks: parseInt(result.Item.clicks.N)
    };
}

// Lambda handler
exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Max-Age': '86400'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        const method = event.httpMethod || event.requestContext?.http?.method;
        const path = event.path || event.rawPath || '';

        // POST /share - Create short link
        if (method === 'POST' && (path === '/share' || path.endsWith('/share'))) {
            const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
            const result = await createShortLink(body);

            return {
                statusCode: 201,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    ...result
                })
            };
        }

        // GET /share/{shortCode} - Retrieve article data
        if (method === 'GET' && path.includes('/share/')) {
            const shortCode = path.split('/share/')[1];

            if (!shortCode || shortCode.length !== 6) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: false,
                        error: 'Invalid short code format'
                    })
                };
            }

            const result = await getShortLink(shortCode);

            if (!result) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: false,
                        error: 'Short link not found or expired'
                    })
                };
            }

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    ...result
                })
            };
        }

        // Unknown endpoint
        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Endpoint not found'
            })
        };

    } catch (error) {
        console.error('Handler error:', error);

        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Internal server error'
            })
        };
    }
};
