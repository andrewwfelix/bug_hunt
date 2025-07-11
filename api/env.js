module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  // Get all environment variables
  const envVars = {};
  for (const [key, value] of Object.entries(process.env)) {
    // Mask sensitive values
    if (key.toLowerCase().includes('key') || key.toLowerCase().includes('token') || key.toLowerCase().includes('secret')) {
      envVars[key] = value ? '***MASKED***' : undefined;
    } else {
      envVars[key] = value;
    }
  }
  
  res.status(200).json({
    message: 'Environment Variables',
    timestamp: new Date().toISOString(),
    total_vars: Object.keys(envVars).length,
    environment: process.env.NODE_ENV || 'development',
    vars: envVars
  });
}; 