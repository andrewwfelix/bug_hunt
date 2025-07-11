export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  res.status(200).json({
    status: 'OK',
    message: 'Bug Hunt API is running',
    version: '1.0.1',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
}; 