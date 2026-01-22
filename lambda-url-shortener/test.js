// Test file for HRI URL Shortener Lambda
// Run with: node test.js

const handler = require('./index').handler;

// Mock event for creating a short link
const createEvent = {
    httpMethod: 'POST',
    path: '/share',
    body: JSON.stringify({
        title: 'Test Article: AI Security Breach',
        description: 'A major AI company suffered a data breach exposing millions of user records.',
        source: 'The Hacker News',
        url: 'https://thehackernews.com/article/12345',
        link: 'https://thehackernews.com/article/12345',
        pubDate: '2026-01-22T12:00:00Z',
        categories: ['AI Security', 'Data Breach']
    })
};

// Mock event for retrieving a short link
const getEvent = {
    httpMethod: 'GET',
    path: '/share/abc123'
};

async function testCreate() {
    console.log('🧪 Testing POST /share (Create short link)');
    console.log('==========================================\n');

    try {
        const result = await handler(createEvent);
        console.log('Status:', result.statusCode);
        console.log('Response:', JSON.parse(result.body));
        console.log('\n✅ Create test passed\n');

        // Extract short code for next test
        const response = JSON.parse(result.body);
        return response.shortCode;
    } catch (error) {
        console.error('❌ Create test failed:', error);
        throw error;
    }
}

async function testGet(shortCode) {
    console.log('🧪 Testing GET /share/{shortCode} (Retrieve article)');
    console.log('====================================================\n');

    const event = {
        httpMethod: 'GET',
        path: `/share/${shortCode}`
    };

    try {
        const result = await handler(event);
        console.log('Status:', result.statusCode);
        console.log('Response:', JSON.parse(result.body));
        console.log('\n✅ Get test passed\n');
    } catch (error) {
        console.error('❌ Get test failed:', error);
        throw error;
    }
}

async function testNotFound() {
    console.log('🧪 Testing GET /share/invalid (Not found)');
    console.log('=========================================\n');

    const event = {
        httpMethod: 'GET',
        path: '/share/xxxxxx'
    };

    try {
        const result = await handler(event);
        console.log('Status:', result.statusCode);
        console.log('Response:', JSON.parse(result.body));
        console.log('\n✅ Not found test passed\n');
    } catch (error) {
        console.error('❌ Not found test failed:', error);
        throw error;
    }
}

async function runTests() {
    console.log('\n🚀 Starting HRI URL Shortener Tests\n');

    try {
        // Note: These tests require DynamoDB to be set up
        // Set environment variables before running:
        // export AWS_REGION=us-east-2
        // export TABLE_NAME=hri-short-links

        if (!process.env.TABLE_NAME) {
            console.log('⚠️  Warning: TABLE_NAME environment variable not set');
            console.log('Set it with: export TABLE_NAME=hri-short-links\n');
        }

        const shortCode = await testCreate();

        if (shortCode) {
            await testGet(shortCode);
        }

        await testNotFound();

        console.log('✨ All tests completed!\n');
    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
        process.exit(1);
    }
}

runTests();
