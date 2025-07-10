module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  res.status(200).json({
    status: 'OK',
    message: 'Bug Hunt API is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      test: '/api/test',
      ask: '/api/ask',
      health: '/api/health',
      homepage: '/'
    }
  });
}; 