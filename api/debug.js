module.exports = function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Log the request for debugging
  console.log('=== Debug Request ===');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Query:', req.query);
  console.log('===================');

  const response = {
    message: "Debug endpoint working!",
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    environment: {
      node_version: process.version,
      platform: process.platform,
      env_vars: {
        has_openai: !!process.env.OPENAI_API_KEY,
        has_blob_storage: !!(process.env.BLOB_STORAGE_URL && process.env.BLOB_STORE_ID),
        llm_provider: process.env.LLM_PROVIDER || 'openai',
        node_env: process.env.NODE_ENV || 'development'
      }
    },
    files: {
      index_exists: true,
      ask_exists: true,
      test_exists: true,
      health_exists: true,
      debug_exists: true
    },
    request_info: {
      headers: req.headers,
      body: req.body,
      query: req.query
    }
  };

  res.status(200).json(response);
}; 