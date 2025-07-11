const axios = require('axios');

// Test different scenarios that could cause 400 errors
async function debug400Error() {
  console.log('🔍 Debugging 400 Error Scenarios\n');
  console.log('=====================================\n');

  const baseUrl = 'http://localhost:3000/api/ask';
  
  const testCases = [
    {
      name: 'Valid request',
      data: { userInput: 'test', sessionId: 'test-123' },
      expected: '200 OK'
    },
    {
      name: 'Missing userInput',
      data: { sessionId: 'test-123' },
      expected: '400 Bad Request'
    },
    {
      name: 'Empty userInput',
      data: { userInput: '', sessionId: 'test-123' },
      expected: '400 Bad Request'
    },
    {
      name: 'userInput as number',
      data: { userInput: 123, sessionId: 'test-123' },
      expected: '400 Bad Request'
    },
    {
      name: 'Malformed JSON',
      data: '{"userInput": "test", "sessionId": "test-123"', // Missing closing brace
      expected: '400 Bad Request',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Wrong Content-Type',
      data: { userInput: 'test', sessionId: 'test-123' },
      expected: '400 Bad Request',
      headers: { 'Content-Type': 'text/plain' }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 Testing: ${testCase.name}`);
    console.log(`Expected: ${testCase.expected}`);
    
    try {
      const config = {
        method: 'POST',
        url: baseUrl,
        headers: {
          'Content-Type': 'application/json',
          ...testCase.headers
        },
        timeout: 5000
      };

      // Handle malformed JSON test case
      if (testCase.name === 'Malformed JSON') {
        config.data = testCase.data;
      } else {
        config.data = testCase.data;
      }

      const response = await axios(config);
      
      console.log(`✅ Actual: ${response.status} ${response.statusText}`);
      if (response.data.error) {
        console.log(`Error: ${response.data.error}`);
        console.log(`Message: ${response.data.message}`);
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ Actual: ${error.response.status} ${error.response.statusText}`);
        console.log(`Error: ${error.response.data.error || 'Unknown error'}`);
        console.log(`Message: ${error.response.data.message || 'No message'}`);
      } else {
        console.log(`❌ Network Error: ${error.message}`);
      }
    }
    
    console.log('---\n');
  }

  // Test environment variables
  console.log('🔧 Environment Check:');
  console.log(`OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`LLM Provider: ${process.env.LLM_PROVIDER || 'openai (default)'}`);
  console.log(`Supabase URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`Supabase Anon Key: ${process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
}

// Run the debug tests
if (require.main === module) {
  debug400Error().catch(console.error);
}

module.exports = { debug400Error }; 