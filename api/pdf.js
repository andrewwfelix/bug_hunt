const axios = require('axios');
const pdfParse = require('pdf-parse');

// Blob storage configuration
const BLOB_STORAGE_URL = process.env.BLOB_STORAGE_URL || 'https://kylktwzpqbalcd5g.public.blob.vercel-storage.com';
const BLOB_STORE_ID = process.env.BLOB_STORE_ID || 'store_kYlKTwzPqBAlcd5g';
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

module.exports = async function handler(req, res) {
  console.log('=== PDF Testing Endpoint ===');
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('1. Starting PDF fetch and parse process...');
    
    // Check blob storage configuration
    console.log('2. Checking blob storage configuration...');
    console.log('BLOB_STORAGE_URL:', BLOB_STORAGE_URL);
    console.log('BLOB_STORE_ID:', BLOB_STORE_ID);
    console.log('BLOB_READ_WRITE_TOKEN:', BLOB_READ_WRITE_TOKEN ? '***SET***' : 'NOT SET');
    
    if (!BLOB_STORAGE_URL || !BLOB_STORE_ID) {
      console.error('3. ERROR: Blob storage not configured');
      return res.status(500).json({
        error: 'Blob storage not configured',
        message: 'Missing BLOB_STORAGE_URL or BLOB_STORE_ID environment variables'
      });
    }

    // Construct the blob URL
    const blobUrl = `${BLOB_STORAGE_URL}/Another-Bug-Hunt-v1.2.pdf`;
    console.log('4. Constructed blob URL:', blobUrl);
    
    // Fetch the PDF from blob storage
    console.log('5. Fetching PDF from blob storage...');
    const startTime = Date.now();
    
    const pdfResponse = await axios.get(blobUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'Bug-Hunt-PDF-Test/1.0'
      }
    });
    
    const fetchTime = Date.now() - startTime;
    console.log('6. PDF fetch completed in', fetchTime, 'ms');
    console.log('7. Response status:', pdfResponse.status);
    console.log('8. Response headers:', pdfResponse.headers);
    console.log('9. PDF size:', pdfResponse.data.length, 'bytes');
    
    // Check if we got a valid PDF
    if (pdfResponse.status !== 200) {
      console.error('10. ERROR: Failed to fetch PDF, status:', pdfResponse.status);
      return res.status(500).json({
        error: 'Failed to fetch PDF',
        status: pdfResponse.status,
        statusText: pdfResponse.statusText
      });
    }
    
    // Parse the PDF
    console.log('11. Starting PDF parsing...');
    const parseStartTime = Date.now();
    
    const pdfData = await pdfParse(pdfResponse.data);
    const parseTime = Date.now() - parseStartTime;
    
    console.log('12. PDF parsing completed in', parseTime, 'ms');
    console.log('13. Parsed PDF info:');
    console.log('   - Pages:', pdfData.numpages);
    console.log('   - Text length:', pdfData.text.length, 'characters');
    console.log('   - Info:', pdfData.info);
    
    // Extract first 1000 characters for preview
    const previewText = pdfData.text.substring(0, 1000);
    const fullTextLength = pdfData.text.length;
    
    console.log('14. Text preview (first 1000 chars):', previewText);
    console.log('15. Total text length:', fullTextLength);
    
    // Return the results
    const result = {
      success: true,
      timing: {
        fetchTime: fetchTime,
        parseTime: parseTime,
        totalTime: fetchTime + parseTime
      },
      pdfInfo: {
        pages: pdfData.numpages,
        textLength: fullTextLength,
        info: pdfData.info
      },
      preview: previewText,
      fullText: pdfData.text,
      blobUrl: blobUrl
    };
    
    console.log('16. Returning successful response');
    console.log('=== PDF Testing Complete ===');
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('ERROR in PDF endpoint:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    let errorResponse = {
      error: 'PDF processing failed',
      message: error.message,
      timestamp: new Date().toISOString()
    };
    
    // Add more specific error information
    if (error.code === 'ECONNREFUSED') {
      errorResponse.details = 'Connection refused - blob storage may be unavailable';
    } else if (error.code === 'ENOTFOUND') {
      errorResponse.details = 'Blob storage URL not found';
    } else if (error.message.includes('InvalidPDFException')) {
      errorResponse.details = 'Invalid PDF data received from blob storage';
    } else if (error.response) {
      errorResponse.details = `HTTP ${error.response.status}: ${error.response.statusText}`;
    }
    
    console.log('=== PDF Testing Failed ===');
    return res.status(500).json(errorResponse);
  }
}; 