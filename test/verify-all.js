const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function verifyAll() {
  console.log('🔍 Comprehensive Bug Hunt API Verification\n');
  console.log('==========================================\n');

  // Test 1: Environment Variables
  console.log('📋 1. Environment Variables Check');
  console.log('--------------------------------');
  
  const envVars = {
    'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
    'LLM_PROVIDER': process.env.LLM_PROVIDER || 'openai',
    'BLOB_STORAGE_URL': process.env.BLOB_STORAGE_URL,
    'BLOB_STORE_ID': process.env.BLOB_STORE_ID,
    'BLOB_READ_WRITE_TOKEN': process.env.BLOB_READ_WRITE_TOKEN,
    'SUPABASE_URL': process.env.SUPABASE_URL,
    'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY,
    'NODE_ENV': process.env.NODE_ENV || 'development'
  };

  let envScore = 0;
  const totalEnvVars = Object.keys(envVars).length;

  for (const [key, value] of Object.entries(envVars)) {
    if (value) {
      console.log(`✅ ${key}: Set (${value.substring(0, 10)}...)`);
      envScore++;
    } else {
      console.log(`❌ ${key}: Missing`);
    }
  }

  console.log(`\nEnvironment Score: ${envScore}/${totalEnvVars}`);
  console.log('');

  // Test 2: Server Health
  console.log('🏥 2. Server Health Check');
  console.log('------------------------');
  
  try {
    const healthResponse = await axios.get('http://localhost:3000/health', { timeout: 5000 });
    console.log(`✅ Health Check: ${healthResponse.status} OK`);
    console.log(`   Status: ${healthResponse.data.status}`);
    console.log(`   Version: ${healthResponse.data.version}`);
    console.log(`   Timestamp: ${healthResponse.data.timestamp}`);
  } catch (error) {
    console.log(`❌ Health Check Failed: ${error.message}`);
  }
  console.log('');

  // Test 3: Environment Debug Endpoint
  console.log('🔧 3. Environment Debug Check');
  console.log('-----------------------------');
  
  try {
    const debugResponse = await axios.get('http://localhost:3000/api/debug', { timeout: 5000 });
    console.log(`✅ Debug Endpoint: ${debugResponse.status} OK`);
    console.log(`   OpenAI: ${debugResponse.data.environment.env_vars.has_openai ? '✅' : '❌'}`);
    console.log(`   Blob Storage: ${debugResponse.data.environment.env_vars.has_blob_storage ? '✅' : '❌'}`);
    console.log(`   LLM Provider: ${debugResponse.data.environment.env_vars.llm_provider}`);
  } catch (error) {
    console.log(`❌ Debug Endpoint Failed: ${error.message}`);
  }
  console.log('');

  // Test 4: API Endpoint Tests
  console.log('🧪 4. API Endpoint Tests');
  console.log('------------------------');
  
  const testCases = [
    {
      name: 'Basic Command',
      input: 'look around',
      expected: 'SSML response with voice tags'
    },
    {
      name: 'Medbay Interaction',
      input: 'check the medbay',
      expected: 'Medical bay description with voices'
    },
    {
      name: 'PDF Reference',
      input: 'where is the bug hunt pdf?',
      expected: 'Blob storage URL in response'
    },
    {
      name: 'Door Interaction',
      input: 'open the door',
      expected: 'Door opening scene'
    },
    {
      name: 'Search Command',
      input: 'search for survivors',
      expected: 'Search scene with multiple voices'
    }
  ];

  let apiScore = 0;
  const totalApiTests = testCases.length;

  for (const testCase of testCases) {
    try {
      console.log(`\n📝 Testing: ${testCase.name}`);
      console.log(`   Input: "${testCase.input}"`);
      
      const response = await axios.post('http://localhost:3000/api/ask', {
        userInput: testCase.input,
        sessionId: 'verify-test-' + Date.now()
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      if (response.status === 200) {
        console.log(`   ✅ Status: ${response.status} OK`);
        console.log(`   ✅ Session ID: ${response.data.sessionId}`);
        
        // Check for SSML tags
        if (response.data.response.includes('<speak>')) {
          console.log(`   ✅ SSML: Present`);
        } else {
          console.log(`   ⚠️  SSML: Missing`);
        }

        // Check for voice tags
        const voiceTags = response.data.response.match(/<voice name="[^"]+">/g);
        if (voiceTags) {
          console.log(`   ✅ Voice Tags: ${voiceTags.length} found`);
        } else {
          console.log(`   ⚠️  Voice Tags: None found`);
        }

        // Check for blob storage URL
        if (response.data.response.includes('kylktwzpqbalcd5g.public.blob.vercel-storage.com')) {
          console.log(`   ✅ Blob URL: Present`);
        } else {
          console.log(`   ⚠️  Blob URL: Not found in this response`);
        }

        apiScore++;
      } else {
        console.log(`   ❌ Status: ${response.status}`);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   ❌ Response: ${error.response.status} - ${error.response.data.error}`);
      }
    }
  }

  console.log(`\nAPI Test Score: ${apiScore}/${totalApiTests}`);
  console.log('');

  // Test 5: Error Handling
  console.log('🚨 5. Error Handling Tests');
  console.log('---------------------------');
  
  const errorTests = [
    {
      name: 'Missing userInput',
      data: { sessionId: 'test' },
      expected: '400 Bad Request'
    },
    {
      name: 'Empty userInput',
      data: { userInput: '', sessionId: 'test' },
      expected: '400 Bad Request'
    },
    {
      name: 'Wrong Content-Type',
      headers: { 'Content-Type': 'text/plain' },
      data: { userInput: 'test', sessionId: 'test' },
      expected: '400 Bad Request'
    }
  ];

  let errorScore = 0;
  const totalErrorTests = errorTests.length;

  for (const test of errorTests) {
    try {
      console.log(`\n📝 Testing: ${test.name}`);
      
      const response = await axios.post('http://localhost:3000/api/ask', test.data, {
        headers: test.headers || { 'Content-Type': 'application/json' },
        timeout: 5000
      });

      console.log(`   ⚠️  Unexpected Success: ${response.status}`);
      
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`   ✅ Correct Error: 400 Bad Request`);
        console.log(`   ✅ Error Message: ${error.response.data.error}`);
        errorScore++;
      } else {
        console.log(`   ❌ Wrong Error: ${error.response?.status || error.message}`);
      }
    }
  }

  console.log(`\nError Handling Score: ${errorScore}/${totalErrorTests}`);
  console.log('');

  // Test 6: Blob Storage Verification
  console.log('🗄️  6. Blob Storage Verification');
  console.log('--------------------------------');
  
  if (process.env.BLOB_STORAGE_URL) {
    console.log(`✅ Blob Storage URL: ${process.env.BLOB_STORAGE_URL}`);
    
    // Test if the blob URL is accessible
    try {
      const blobUrl = `${process.env.BLOB_STORAGE_URL}/Another-Bug-Hunt-v1.2.pdf`;
      console.log(`🔗 Testing PDF URL: ${blobUrl}`);
      
      const blobResponse = await axios.head(blobUrl, { timeout: 5000 });
      console.log(`✅ PDF Accessible: ${blobResponse.status} OK`);
    } catch (error) {
      console.log(`❌ PDF Not Accessible: ${error.message}`);
    }
  } else {
    console.log(`❌ Blob Storage URL: Not configured`);
  }

  if (process.env.BLOB_STORE_ID) {
    console.log(`✅ Blob Store ID: ${process.env.BLOB_STORE_ID}`);
  } else {
    console.log(`❌ Blob Store ID: Not configured`);
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    console.log(`✅ Blob Token: Set (${process.env.BLOB_READ_WRITE_TOKEN.substring(0, 20)}...)`);
  } else {
    console.log(`❌ Blob Token: Not configured`);
  }
  console.log('');

  // Test 7: Supabase Connection (if configured)
  console.log('📊 7. Supabase Connection Test');
  console.log('-------------------------------');
  
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      const supabaseResponse = await axios.get(`${process.env.SUPABASE_URL}/rest/v1/`, {
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          'apikey': process.env.SUPABASE_ANON_KEY
        },
        timeout: 5000
      });
      console.log(`✅ Supabase Connection: ${supabaseResponse.status} OK`);
    } catch (error) {
      console.log(`❌ Supabase Connection Failed: ${error.message}`);
    }
  } else {
    console.log(`⚠️  Supabase: Not configured (optional)`);
  }
  console.log('');

  // Final Summary
  console.log('📊 FINAL SUMMARY');
  console.log('================');
  console.log(`Environment Variables: ${envScore}/${totalEnvVars} ✅`);
  console.log(`API Endpoints: ${apiScore}/${totalApiTests} ✅`);
  console.log(`Error Handling: ${errorScore}/${totalErrorTests} ✅`);
  console.log('');
  
  const overallScore = envScore + apiScore + errorScore;
  const totalPossible = totalEnvVars + totalApiTests + totalErrorTests;
  
  console.log(`Overall Score: ${overallScore}/${totalPossible}`);
  
  if (overallScore === totalPossible) {
    console.log('🎉 ALL TESTS PASSED! Your API is ready for production!');
  } else {
    console.log('⚠️  Some tests failed. Check the issues above.');
  }
  
  console.log('\n🚀 Ready to test at: http://localhost:3000/');
}

// Run the verification
if (require.main === module) {
  verifyAll().catch(console.error);
}

module.exports = { verifyAll }; 