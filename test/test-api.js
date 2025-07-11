const axios = require('axios');

// Test the API endpoint locally
async function testAPI() {
  try {
    console.log('🧪 Testing Bug Hunt API...\n');
    
    const testCases = [
      {
        name: 'Basic door interaction',
        input: 'open the door',
        expected: 'SSML response with voice tags'
      },
      {
        name: 'Medbay exploration',
        input: 'check the medbay',
        expected: 'SSML response with multiple voices'
      },
      {
        name: 'Search command',
        input: 'search for survivors',
        expected: 'SSML response with narration'
      }
    ];

    for (const testCase of testCases) {
      console.log(`📝 Testing: ${testCase.name}`);
      console.log(`Input: "${testCase.input}"`);
      
      try {
        const response = await axios.post('http://localhost:3000/api/ask', {
          userInput: testCase.input,
          sessionId: 'test-session-' + Date.now()
        }, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });

        console.log(`✅ Response received:`);
        console.log(`Status: ${response.status}`);
        console.log(`Response: ${response.data.response.substring(0, 100)}...`);
        console.log('---\n');
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.response) {
          console.log(`Status: ${error.response.status}`);
          console.log(`Data: ${JSON.stringify(error.response.data)}`);
        }
        console.log('---\n');
      }
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Test environment variables
function testEnvironment() {
  console.log('🔧 Environment Check:\n');
  
  const requiredVars = [
    'OPENAI_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`❌ ${varName}: Not set`);
    }
  }
  
  console.log('\n');
}

// Run tests
async function runTests() {
  console.log('🚀 Bug Hunt API Test Suite\n');
  console.log('=====================================\n');
  
  testEnvironment();
  await testAPI();
  
  console.log('✨ Test suite completed!');
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testAPI, testEnvironment }; 