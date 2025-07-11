module.exports = function handler(req, res) {
  res.json({ 
    message: 'Simple test function working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}; 