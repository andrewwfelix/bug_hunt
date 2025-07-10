const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const axios = require('axios');

// Initialize LLM clients conditionally
let genAI = null;
let openai = null;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Blob storage configuration
const BLOB_STORAGE_URL = 'https://bug_hunt.blob.vercel-storage.com/Another-Bug-Hunt-v1.2.pdf';

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

MODULE REFERENCE: The game is based on "Another Bug Hunt v1.2" module stored at https://bug_hunt.blob.vercel-storage.com/Another-Bug-Hunt-v1.2.pdf

KEY LOCATIONS:
- Medbay: Medical facilities with organic contamination
- Bridge: Command center with flickering screens
- Engineering: Power systems and maintenance areas
- Cargo Bay: Storage areas with mysterious containers
- Living Quarters: Crew quarters with personal effects
- Air Locks: Entry/exit points to the station

ALIEN ELEMENTS:
- Organic growths on walls and equipment
- Strange sounds and movements in shadows
- Contaminated areas with unknown substances
- Signs of struggle and missing crew
- Mysterious technology and artifacts

RESPONSE FORMAT:
<speak>
  <voice name="Joanna">[Narration describing the scene]</voice>
  <voice name="Matthew">[Military NPC dialogue if applicable]</voice>
  <voice name="Ivy">[Creepy/alien voice if applicable]</voice>
</speak>

Remember: Keep it immersive, scary, and under 750 characters total.`;

export default async function handler(req, res) {
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

    // Choose LLM provider (default to OpenAI, fallback to Gemini)
    const llmProvider = process.env.LLM_PROVIDER || 'openai';
    let llmResponse;

    try {
      if (llmProvider === 'gemini') {
        llmResponse = await callGemini(userInput);
      } else {
        llmResponse = await callOpenAI(userInput);
      }
    } catch (error) {
      console.error('LLM Error:', error.message);
      return res.status(500).json({ 
        error: 'LLM service error',
        message: error.message,
        response: '<speak><voice name="Joanna">Sorry, the AI service is currently unavailable. Please try again later.</voice></speak>'
      });
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
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }
  
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `${SYSTEM_PROMPT}\n\nPlayer says: "${userInput}"\n\nRespond with SSML:`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

async function callOpenAI(userInput) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }
  
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

async function getModuleContent() {
  try {
    // For now, we'll reference the PDF in the prompt
    // In the future, you could fetch and parse the PDF content here
    return `Another Bug Hunt v1.2 - Sci-fi Horror TTRPG Module
    
    SETTING: Derelict space station with organic growths
    TONE: Horror, survival, investigation
    THEMES: Isolation, corruption, alien infestation
    
    The module contains detailed descriptions of:
    - Space station layout and rooms
    - Alien creatures and their behaviors
    - Environmental hazards and atmosphere
    - NPCs and their motivations
    - Key locations and items
    - Horror elements and jump scares`;
  } catch (error) {
    console.error('Error fetching module content:', error);
    return 'Another Bug Hunt - Sci-fi Horror TTRPG Module';
  }
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