module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  res.status(200).json({
    version: '1.0.4',
    build: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Bug Hunt API Version Endpoint'
  });
}; 