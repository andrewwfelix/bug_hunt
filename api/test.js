module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  res.status(200).json({
    message: 'Bug Hunt API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers,
    environment: {
      node_version: process.version,
      platform: process.platform,
      env_vars: {
        has_openai: !!process.env.OPENAI_API_KEY,
        has_supabase: !!process.env.SUPABASE_URL,
        llm_provider: process.env.LLM_PROVIDER || 'openai'
      }
    }
  });
}; 