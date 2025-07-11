module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(4.0);
}; 