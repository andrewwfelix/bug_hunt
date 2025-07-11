const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function checkSupabaseConfig() {
  console.log('🔍 Checking Supabase Configuration\n');
  console.log('=====================================\n');

  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  console.log('📋 Environment Variables:');
  console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`OPENAI_API_KEY: ${openaiKey ? '✅ Set' : '❌ Missing'}`);
  console.log('');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Supabase configuration is incomplete!');
    console.log('Please check your .env.local file.');
    return;
  }

  // Test DNS resolution
  console.log('🌐 Testing DNS Resolution:');
  try {
    const url = new URL(supabaseUrl);
    console.log(`Hostname: ${url.hostname}`);
    
    // Test if the URL is reachable
    const testUrl = `${supabaseUrl}/rest/v1/`;
    console.log(`Testing connection to: ${testUrl}`);
    
    const response = await axios.get(testUrl, {
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      timeout: 5000
    });
    
    console.log('✅ Supabase connection successful!');
    console.log(`Status: ${response.status}`);
    
  } catch (error) {
    console.log('❌ Supabase connection failed!');
    if (error.code === 'ENOTFOUND') {
      console.log('Error: DNS resolution failed - URL not found');
      console.log('This usually means:');
      console.log('1. The Supabase project has been deleted');
      console.log('2. The project URL is incorrect');
      console.log('3. Network connectivity issues');
    } else if (error.response) {
      console.log(`Error: ${error.response.status} - ${error.response.statusText}`);
      if (error.response.status === 401) {
        console.log('This means your API key is invalid');
      }
    } else {
      console.log(`Error: ${error.message}`);
    }
  }

  // Test the logs table
  console.log('\n📊 Testing Database Schema:');
  try {
    const response = await axios.get(`${supabaseUrl}/rest/v1/logs?select=count`, {
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      timeout: 5000
    });
    
    console.log('✅ Logs table exists and is accessible!');
    
  } catch (error) {
    console.log('❌ Logs table test failed!');
    if (error.response && error.response.status === 404) {
      console.log('The logs table does not exist. You need to run the schema.sql file.');
    } else {
      console.log(`Error: ${error.message}`);
    }
  }

  console.log('\n🔧 Recommendations:');
  console.log('1. Check your Supabase project at https://supabase.com/dashboard');
  console.log('2. Verify the project URL and API keys');
  console.log('3. Run the schema.sql file in your Supabase SQL editor');
  console.log('4. Test the connection with the script above');
}

// Run the check
if (require.main === module) {
  checkSupabaseConfig().catch(console.error);
}

module.exports = { checkSupabaseConfig }; 