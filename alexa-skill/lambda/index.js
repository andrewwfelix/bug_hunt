const axios = require('axios');

const VERCEL_ENDPOINT = 'https://bug-hunt-o365o6hkh-andrew-felixs-projects.vercel.app/api/ask';

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const { request, session } = event;
  const sessionId = session.sessionId;

  try {
    switch (request.type) {
      case 'LaunchRequest':
        return handleLaunchRequest();
      
      case 'IntentRequest':
        return await handleIntentRequest(request, sessionId);
      
      case 'SessionEndedRequest':
        return handleSessionEndedRequest();
      
      default:
        return buildResponse('I did not understand that. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    return buildResponse('Sorry, there was an error processing your request. Please try again.');
  }
};

function handleLaunchRequest() {
  const speechText = '<speak><voice name="Joanna">Mission online. Awaiting orders.</voice></speak>';
  
  return buildResponse(speechText, {
    cardTitle: 'Bug Hunt',
    cardContent: 'Mission online. Awaiting orders.'
  });
}

async function handleIntentRequest(request, sessionId) {
  const intentName = request.intent.name;
  
  if (intentName === 'CatchAllIntent') {
    const userInput = request.intent.slots.userInput.value;
    return await processUserInput(userInput, sessionId);
  } else if (intentName === 'AMAZON.HelpIntent') {
    return buildResponse('<speak><voice name="Joanna">You can explore the space station by describing your actions. Try saying things like open the door, check the medbay, or search for survivors.</voice></speak>');
  } else if (intentName === 'AMAZON.CancelIntent' || intentName === 'AMAZON.StopIntent') {
    return buildResponse('<speak><voice name="Joanna">Mission terminated. Good luck out there.</voice></speak>', {
      shouldEndSession: true
    });
  } else {
    return buildResponse('<speak><voice name="Joanna">I did not understand that command. Please try again.</voice></speak>');
  }
}

async function processUserInput(userInput, sessionId) {
  try {
    console.log('Sending to Vercel:', { userInput, sessionId });
    
    const response = await axios.post(VERCEL_ENDPOINT, {
      userInput,
      sessionId
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    const llmResponse = response.data.response;
    console.log('LLM Response:', llmResponse);

    return buildResponse(llmResponse);
  } catch (error) {
    console.error('Error calling Vercel API:', error);
    
    if (error.code === 'ECONNABORTED') {
      return buildResponse('<speak><voice name="Joanna">System is taking too long to respond. Please try again.</voice></speak>');
    }
    
    return buildResponse('<speak><voice name="Joanna">Sorry, there was an error processing your request. Please try again.</voice></speak>');
  }
}

function handleSessionEndedRequest() {
  return buildResponse('<speak><voice name="Joanna">Mission terminated. Good luck out there.</voice></speak>', {
    shouldEndSession: true
  });
}

function buildResponse(speechText, options = {}) {
  const response = {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'SSML',
        ssml: speechText
      },
      shouldEndSession: options.shouldEndSession || false
    }
  };

  if (options.cardTitle && options.cardContent) {
    response.response.card = {
      type: 'Simple',
      title: options.cardTitle,
      content: options.cardContent
    };
  }

  return response;
} 