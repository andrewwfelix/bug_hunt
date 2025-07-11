const OpenAI = require('openai');
const axios = require('axios');

// Initialize OpenAI client
let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Blob storage configuration
const BLOB_STORAGE_URL = process.env.BLOB_STORAGE_URL || 'https://kylktwzpqbalcd5g.public.blob.vercel-storage.com';
const BLOB_STORE_ID = process.env.BLOB_STORE_ID || 'store_kYlKTwzPqBAlcd5g';
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// Module content cache
let moduleContentCache = null;
let moduleContentCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

MODULE REFERENCE: The game is based on "Another Bug Hunt v1.2" module stored at ${BLOB_STORAGE_URL}/Another-Bug-Hunt-v1.2.pdf (store ID: ${BLOB_STORE_ID})

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

module.exports = async function handler(req, res) {
  // Set CORS headers for Alexa
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  // Debug: Log the incoming request
  console.log('=== Alexa Request Debug ===');
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('========================');

  const alexaRequest = req.body;

  // Handle LaunchRequest (skill opened)
  if (alexaRequest.request?.type === 'LaunchRequest') {
    console.log("LaunchRequest detected - returning welcome message");
    
    return res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "SSML",
          ssml: "<speak><voice name=\"Joanna\">Welcome Scientist. You are aboard the derelict space station. The crew has been missing for weeks. Strange organic growths cover the walls. Something is hunting in the shadows. What would you like to do?</voice></speak>"
        },
        shouldEndSession: false,
      },
    });
  }

  // Handle IntentRequest (user spoke a command)
  if (alexaRequest.request?.type === 'IntentRequest') {
    console.log("IntentRequest detected");
    
    // Extract user input from the intent
    let userInput = '';
    if (alexaRequest.request.intent?.slots?.userInput?.value) {
      userInput = alexaRequest.request.intent.slots.userInput.value;
    } else if (alexaRequest.request.intent?.slots?.query?.value) {
      userInput = alexaRequest.request.intent.slots.query.value;
    }

    console.log('Extracted userInput:', userInput);

    if (!userInput) {
      return res.status(200).json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "SSML",
            ssml: "<speak><voice name=\"Joanna\">I didn't catch that. Could you please repeat your command?</voice></speak>"
          },
          shouldEndSession: false,
        },
      });
    }

    try {
      // Check if OpenAI is configured
      if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API key not configured');
        return res.status(200).json({
          version: "1.0",
          response: {
            outputSpeech: {
              type: "SSML",
              ssml: "<speak><voice name=\"Joanna\">Sorry, the AI service is not configured. Please check your environment variables.</voice></speak>"
            },
            shouldEndSession: true,
          },
        });
      }

      // Call OpenAI to generate response
      let llmResponse;
      try {
        llmResponse = await callOpenAI(userInput);
        console.log('LLM Response:', llmResponse);
      } catch (error) {
        console.error('LLM Error:', error.message);
        return res.status(200).json({
          version: "1.0",
          response: {
            outputSpeech: {
              type: "SSML",
              ssml: "<speak><voice name=\"Joanna\">Sorry, the AI service is currently unavailable. Please try again later.</voice></speak>"
            },
            shouldEndSession: true,
          },
        });
      }

      // Return response in proper Alexa format
      return res.status(200).json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "SSML",
            ssml: llmResponse
          },
          shouldEndSession: false,
        },
      });

    } catch (error) {
      console.error('Error in /api/ask:', error);
      return res.status(200).json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "SSML",
            ssml: "<speak><voice name=\"Joanna\">System error. Please try again.</voice></speak>"
          },
          shouldEndSession: true,
        },
      });
    }
  }

  // Fallback for unknown or unsupported request types
  console.log("Unsupported request type or missing data");
  return res.status(200).json({
    version: "1.0",
    response: {
      outputSpeech: {
        type: "SSML",
        ssml: "<speak><voice name=\"Joanna\">Sorry, I didn't understand that. Please try opening the skill again.</voice></speak>"
      },
      shouldEndSession: true,
    },
  });
};



async function callOpenAI(userInput) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }
  
  // Try to fetch module content from blob storage
  let moduleContent = '';
  try {
    moduleContent = await getModuleContent();
  } catch (error) {
    console.warn('Could not fetch module content from blob storage:', error.message);
    moduleContent = 'Another Bug Hunt v1.2 - Sci-fi Horror TTRPG Module (content not available)';
  }
  
  const enhancedSystemPrompt = `${SYSTEM_PROMPT}\n\nMODULE CONTENT:\n${moduleContent}\n\n`;
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: enhancedSystemPrompt },
      { role: "user", content: userInput }
    ],
    max_tokens: 500,
    temperature: 0.8
  });

  return completion.choices[0].message.content;
}

async function getModuleContent() {
  // Check cache first
  const now = Date.now();
  if (moduleContentCache && moduleContentCacheTime && (now - moduleContentCacheTime) < CACHE_DURATION) {
    console.log('Using cached module content');
    return moduleContentCache;
  }

  try {
    // Check if we have blob storage configuration
    if (!BLOB_STORAGE_URL || !BLOB_STORE_ID) {
      console.warn('Blob storage not configured, using fallback content');
      const fallbackContent = getFallbackModuleContent();
      moduleContentCache = fallbackContent;
      moduleContentCacheTime = now;
      return fallbackContent;
    }

    // Construct the blob URL
    const blobUrl = `${BLOB_STORAGE_URL}/Another-Bug-Hunt-v1.2.pdf`;
    
    console.log('Fetching module content from:', blobUrl);
    
    // For now, we'll return a structured summary since PDF parsing is complex
    // In a full implementation, you'd fetch the PDF and extract text content
    const content = `Another Bug Hunt v1.2 - Sci-fi Horror TTRPG Module
    
    SETTING: Derelict space station with organic growths
    TONE: Horror, survival, investigation
    THEMES: Isolation, corruption, alien infestation
    
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
    
    GAME MECHANICS:
    - Players investigate the station
    - Discover clues about missing crew
    - Encounter alien threats
    - Manage resources and survival
    - Make critical decisions under pressure
    
    MODULE SOURCE: ${blobUrl}`;
    
    // Cache the content
    moduleContentCache = content;
    moduleContentCacheTime = now;
    console.log('Module content cached for 5 minutes');
    
    return content;
    
  } catch (error) {
    console.error('Error fetching module content:', error);
    const fallbackContent = getFallbackModuleContent();
    moduleContentCache = fallbackContent;
    moduleContentCacheTime = now;
    return fallbackContent;
  }
}

function getFallbackModuleContent() {
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
}

// Supabase logging disabled - no database configured
// async function logToSupabase(sessionId, userInput, llmResponse) {
//   // Database logging removed for now
// } 