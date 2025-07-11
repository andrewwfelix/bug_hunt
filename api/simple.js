module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  res.status(200).json({
    message: 'Simple API route working!',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    success: true
  });
}; 