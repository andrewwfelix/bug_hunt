module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  console.log('Debug endpoint called:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
  
  res.status(200).json({
    message: 'Debug endpoint working!',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    environment: {
      node_version: process.version,
      platform: process.platform,
      env_vars: {
        has_openai: !!process.env.OPENAI_API_KEY,
        has_blob_storage: !!process.env.BLOB_STORAGE_URL,
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
    }
  });
}; 