const express = require('express');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Import the API handlers
const askHandler = require('./api/ask');
const indexHandler = require('./api/index');
const debugHandler = require('./api/debug');

// API Routes
app.post('/api/ask', (req, res) => {
  askHandler(req, res);
});

app.get('/', (req, res) => {
  indexHandler(req, res);
});

app.get('/api', (req, res) => {
  indexHandler(req, res);
});

app.get('/api/debug', (req, res) => {
  debugHandler(req, res);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Bug Hunt API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: 'Endpoint not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🎮 Bug Hunt API Server');
  console.log('========================');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test API: http://localhost:${PORT}/api/ask`);
  console.log(`🏠 Homepage: http://localhost:${PORT}/`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log('  GET  /              - Homepage with testing interface');
  console.log('  GET  /health        - Health check');
  console.log('  GET  /api/debug     - Environment debug');
  console.log('  POST /api/ask       - Main API endpoint');
  console.log('');
  console.log('🎭 Voice Characters: Joanna, Matthew, Ivy, Justin');
  console.log('🤖 LLM Support: OpenAI');
  console.log('📊 Database: Supabase');
  console.log('');
  console.log('🔧 Environment Check:');
  console.log(`  OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`  Blob Storage URL: ${process.env.BLOB_STORAGE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`  Blob Store ID: ${process.env.BLOB_STORE_ID ? '✅ Set' : '❌ Missing'}`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
}); 