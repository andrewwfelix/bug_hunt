# Bug Hunt - Alexa + LLM TTRPG Voice Assistant

A voice-driven TTRPG experience powered by Alexa, Vercel, and Large Language Models. Experience "Another Bug Hunt" through natural voice interaction.

## 🎮 Overview

When users say "Alexa, open Bug Hunt," they enter a sci-fi horror TTRPG where they navigate a derelict space station. The system uses LLMs (Gemini or GPT-4o) to generate dynamic, immersive responses with multiple voices using SSML.

## 🏗️ Architecture

```
Alexa Device → Alexa Skill → Vercel API → LLM (Gemini/OpenAI) → Supabase Logging
```

### Components

- **Alexa Skill**: Handles voice input/output with SSML support
- **Vercel Backend**: Node.js API that processes requests and manages LLM calls
- **LLM Integration**: Supports both Google Gemini and OpenAI GPT-4o
- **Supabase**: REST API logging for session history and analytics
- **Vercel Blob Storage**: Hosts the TTRPG module content

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo>
cd bug_hunt
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```env
# LLM Configuration
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
LLM_PROVIDER=gemini  # or 'openai'

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

### 4. Update Alexa Skill

1. Go to [Amazon Developer Console](https://developer.amazon.com/alexa)
2. Create a new skill
3. Update the endpoint URL in `alexa-skill/skill.json`
4. Upload the skill configuration

### 5. Setup Supabase

1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql`
3. Get your project URL and anon key
4. Update environment variables

## 📁 Project Structure

```
bug_hunt/
├── api/
│   └── ask.js              # Main API endpoint
├── alexa-skill/
│   ├── skill.json          # Alexa skill configuration
│   └── lambda/
│       └── index.js        # Alexa Lambda function
├── supabase/
│   └── schema.sql          # Database schema
├── package.json
├── vercel.json
└── README.md
```

## 🎯 API Endpoints

### POST /api/ask

Handles Alexa requests and LLM integration.

**Request:**
```json
{
  "userInput": "open the door",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "response": "<speak><voice name=\"Joanna\">You approach the door...</voice></speak>",
  "sessionId": "session-id"
}
```

## 🎭 Voice Characters

The system uses different Alexa voices for immersive storytelling:

- **Joanna**: Main narration and descriptions
- **Matthew**: Military NPCs and commands
- **Ivy**: Creepy/alien voices and horror elements
- **Justin**: Computer/AI systems

## 🔧 Configuration

### LLM Providers

**Gemini (Default):**
```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_key
```

**OpenAI:**
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=your_key
```

### Supabase Logging

The system automatically logs all interactions to Supabase:

- Session ID tracking
- User prompts
- LLM responses
- Timestamps

## 🧪 Testing

### Local Development

```bash
npm run dev
```

### Alexa Testing

1. Use the Alexa Developer Console simulator
2. Test with physical Alexa devices
3. Use commands like:
   - "Alexa, open Bug Hunt"
   - "Check the medbay"
   - "Open the door"
   - "Search for survivors"

## 📊 Monitoring

### Supabase Analytics

Query session data:

```sql
-- Recent sessions
SELECT * FROM get_recent_sessions(10);

-- Session summaries
SELECT * FROM session_summaries;
```

### Vercel Logs

Monitor API performance and errors in Vercel dashboard.

## 🔮 Future Enhancements

- [ ] ElevenLabs voice integration
- [ ] Persistent game state management
- [ ] Multiplayer support
- [ ] Web frontend for hybrid gameplay
- [ ] Advanced session analytics
- [ ] Custom voice training

## 🛠️ Troubleshooting

### Common Issues

1. **Alexa not responding**: Check endpoint URL and SSL certificate
2. **LLM timeouts**: Increase timeout in Lambda function
3. **Supabase errors**: Verify API keys and table permissions
4. **SSML issues**: Ensure proper voice name formatting

### Debug Mode

Enable detailed logging:

```env
DEBUG=true
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in this repository
- Check the troubleshooting section
- Review Vercel and Supabase documentation 