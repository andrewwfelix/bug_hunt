const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const axios = require('axios');

// Initialize LLM clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for the TTRPG game
const SYSTEM_PROMPT = `You are the Game Master AI running "Another Bug Hunt," a sci-fi horror TTRPG module.

IMPORTANT RULES:
- Always respond using SSML inside <speak>...</speak> tags
- Keep responses under 8 seconds when spoken and under 750 characters
- Use immersive, in-universe tone - no explanations or meta-commentary
- Use specific voices for different characters:
  * Narration = <voice name="Joanna">...</voice>
  * Military NPC = <voice name="Matthew">...</voice>
  * Creepy voice = <voice name="Ivy">...</voice>
  * Computer/AI = <voice name="Justin">...</voice>

GAME CONTEXT:
You're on a derelict space station. The crew has been missing for weeks. Strange organic growths cover the walls. Something is hunting in the shadows.

MODULE REFERENCE: The game is based on "Another Bug Hunt" module stored at https://blob.vercel-storage.com/another-bug-hunt.txt

RESPONSE FORMAT:
<speak>
  <voice name="Joanna">[Narration describing the scene]</voice>
  <voice name="Matthew">[Military NPC dialogue if applicable]</voice>
  <voice name="Ivy">[Creepy/alien voice if applicable]</voice>
</speak>

Remember: Keep it immersive, scary, and under 750 characters total.`;

module.exports = async (req, res) => {
  // Set CORS headers for Alexa
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userInput, sessionId } = req.body;

    if (!userInput) {
      return res.status(400).json({ error: 'userInput is required' });
    }

    // Choose LLM provider (default to Gemini, fallback to OpenAI)
    const llmProvider = process.env.LLM_PROVIDER || 'gemini';
    let llmResponse;

    if (llmProvider === 'gemini') {
      llmResponse = await callGemini(userInput);
    } else {
      llmResponse = await callOpenAI(userInput);
    }

    // Log to Supabase
    await logToSupabase(sessionId, userInput, llmResponse);

    // Return response in Alexa-compatible format
    res.status(200).json({
      response: llmResponse,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Error in /api/ask:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      response: '<speak><voice name="Joanna">System error. Please try again.</voice></speak>'
    });
  }
};

async function callGemini(userInput) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `${SYSTEM_PROMPT}\n\nPlayer says: "${userInput}"\n\nRespond with SSML:`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

async function callOpenAI(userInput) {
  const prompt = `${SYSTEM_PROMPT}\n\nPlayer says: "${userInput}"\n\nRespond with SSML:`;
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userInput }
    ],
    max_tokens: 500,
    temperature: 0.8
  });

  return completion.choices[0].message.content;
}

async function logToSupabase(sessionId, userInput, llmResponse) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured, skipping logging');
      return;
    }

    const logData = {
      session_id: sessionId || 'default',
      prompt: userInput,
      response: llmResponse,
      created_at: new Date().toISOString()
    };

    await axios.post(`${supabaseUrl}/rest/v1/logs`, logData, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      }
    });

    console.log('Logged to Supabase successfully');
  } catch (error) {
    console.error('Error logging to Supabase:', error);
    // Don't fail the request if logging fails
  }
} 