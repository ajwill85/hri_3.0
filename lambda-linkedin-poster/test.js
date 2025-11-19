// Test script for LinkedIn poster Lambda function
// Run with: node test.js

const handler = require('./index').handler;

// Mock event
const event = {
  source: 'aws.events',
  time: new Date().toISOString()
};

// Test the function
async function test() {
  console.log('Testing LinkedIn Auto-Poster...\n');
  
  // Check for access token
  if (!process.env.LINKEDIN_ACCESS_TOKEN) {
    console.error('❌ LINKEDIN_ACCESS_TOKEN environment variable not set');
    console.log('\nSet it with:');
    console.log('export LINKEDIN_ACCESS_TOKEN="your_token_here"');
    process.exit(1);
  }

  try {
    const result = await handler(event);
    console.log('\n✅ Test completed successfully!\n');
    console.log('Response:');
    console.log(JSON.stringify(JSON.parse(result.body), null, 2));
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

test();
