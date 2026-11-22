// Lambda Function: HRI URL Shortener
// Deploy this to AWS Lambda with Node.js 24.x runtime
// Version: 1.0.0

const crypto = require('crypto');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutItemCommand, GetItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-2' });
const TABLE_NAME = process.env.TABLE_NAME || 'hri-short-links';
const BASE_URL = process.env.BASE_URL || 'https://humanriskintel.com';

// Origins allowed to call this API. The production default is the public
// site only. Set ALLOWED_ORIGINS to a comma-separated list to replace it
// (staging or preview hosts). Local development origins are included only
// when ALLOW_LOCALHOST=true and ALLOWED_ORIGINS is not set.
const PRODUCTION_ORIGINS = 'https://humanriskintel.com,https://www.humanriskintel.com';
const LOCAL_ORIGINS = 'http://localhost:3000,http://localhost:4173';

function parseOriginList(value) {
    return String(value)
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean);
}

const allowLocalhost = /^(1|true|yes)$/i.test(String(process.env.ALLOW_LOCALHOST || '').trim());
const defaultOrigins = allowLocalhost
    ? `${PRODUCTION_ORIGINS},${LOCAL_ORIGINS}`
    : PRODUCTION_ORIGINS;

const ALLOWED_ORIGINS = parseOriginList(process.env.ALLOWED_ORIGINS || defaultOrigins);

// Caps on what a caller can persist. This endpoint is unauthenticated, so the
// stored payload is untrusted input: only these fields are kept, each is
// length-capped, and the whole item has to stay under MAX_PAYLOAD_BYTES.
const MAX_PAYLOAD_BYTES = 4096;
const FIELD_LIMITS = {
    title: 300,
    description: 1000,
    source: 200,
    url: 2048,
    link: 2048,
    pubDate: 40
};
const MAX_CATEGORIES = 10;
const MAX_CATEGORY_LENGTH = 60;

// Generate random short code (6 characters, Base62)
function generateShortCode() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // Rejection sampling keeps the distribution uniform: 256 % 62 != 0, so
    // bytes at or above the largest multiple of 62 are discarded rather than
    // folded back with a modulo bias.
    const limit = Math.floor(256 / chars.length) * chars.length;
    let code = '';
    while (code.length < 6) {
        for (const byte of crypto.randomBytes(6)) {
            if (byte < limit) {
                code += chars[byte % chars.length];
                if (code.length === 6) break;
            }
        }
    }
    return code;
}

// Article links are rendered as anchors by the frontend, so only plain
// http(s) URLs are accepted — javascript:, data: and friends are rejected here
// as well as at render time.
function safeExternalUrl(raw) {
    if (!raw || typeof raw !== 'string') return null;
    try {
        const { protocol } = new URL(raw);
        return protocol === 'http:' || protocol === 'https:' ? raw : null;
    } catch {
        return null;
    }
}

// Validate and reduce caller input to the fields the share view actually reads
function sanitizeArticleData(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return { valid: false, error: 'Article data must be an object' };
    }

    if (!data.title || typeof data.title !== 'string') {
        return { valid: false, error: 'Article title is required' };
    }

    const url = safeExternalUrl(data.url) || safeExternalUrl(data.link);
    if (!url) {
        return { valid: false, error: 'A valid http(s) article URL is required' };
    }

    const clean = { url, link: url };
    for (const field of ['title', 'description', 'source', 'pubDate']) {
        if (typeof data[field] === 'string' && data[field]) {
            clean[field] = data[field].slice(0, FIELD_LIMITS[field]);
        }
    }

    const categories = Array.isArray(data.categories)
        ? data.categories
        : (typeof data.categories === 'string' ? [data.categories] : []);
    clean.categories = categories
        .filter(c => typeof c === 'string' && c)
        .slice(0, MAX_CATEGORIES)
        .map(c => c.slice(0, MAX_CATEGORY_LENGTH));

    const serialized = JSON.stringify(clean);
    if (Buffer.byteLength(serialized, 'utf8') > MAX_PAYLOAD_BYTES) {
        return { valid: false, error: 'Article data too large' };
    }

    return { valid: true, data: clean, serialized };
}

// Create short link
async function createShortLink(rawArticleData) {
    const validation = sanitizeArticleData(rawArticleData);
    if (!validation.valid) {
        const error = new Error(validation.error);
        error.statusCode = 400;
        throw error;
    }

    const articleData = validation.data;

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
    const method = event.httpMethod || event.requestContext?.http?.method;
    const path = event.path || event.rawPath || '';
    console.log(`Request: ${method} ${path}`);

    const requestOrigin = event.headers?.origin || event.headers?.Origin;
    const allowedOrigin = ALLOWED_ORIGINS.includes(requestOrigin)
        ? requestOrigin
        : ALLOWED_ORIGINS[0];

    const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
        'Vary': 'Origin',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Max-Age': '86400'
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        // POST /share - Create short link
        if (method === 'POST' && (path === '/share' || path.endsWith('/share'))) {
            if (typeof event.body === 'string' && Buffer.byteLength(event.body, 'utf8') > MAX_PAYLOAD_BYTES * 2) {
                return {
                    statusCode: 413,
                    headers: corsHeaders,
                    body: JSON.stringify({ success: false, error: 'Request body too large' })
                };
            }

            let body;
            try {
                body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
            } catch {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ success: false, error: 'Invalid JSON body' })
                };
            }

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

            if (!/^[0-9a-zA-Z]{6}$/.test(shortCode || '')) {
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

        // Validation errors carry a 400 and a caller-safe message; anything
        // else stays generic so internals don't leak into the response.
        const statusCode = error.statusCode || 500;
        return {
            statusCode,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: statusCode === 400 ? error.message : 'Internal server error'
            })
        };
    }
};
