module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  res.status(200).json({
    message: 'Simple test endpoint working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}; 