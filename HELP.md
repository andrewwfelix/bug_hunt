# 🎮 Bug Hunt - Quick Help Guide

## 🚀 Quick Start

### 1. Setup Environment
```bash
cp env.example .env.local
# Edit .env.local with your API keys
```

### 2. Deploy to Vercel
```bash
npx vercel --prod
```

### 3. Configure Alexa Skill
- Go to [Amazon Developer Console](https://developer.amazon.com/alexa)
- Create skill with invocation name: "bug hunt"
- Set endpoint: `https://your-project.vercel.app/api/ask`

### 4. Setup Supabase
- Create project at [supabase.com](https://supabase.com)
- Run SQL from `supabase/schema.sql`
- Update environment variables

## 📁 File Structure

```
bug_hunt/
├── api/ask.js                    # Main API endpoint
├── alexa-skill/skill.json       # Alexa skill config
├── alexa-skill/lambda/index.js  # Alexa Lambda function
├── supabase/schema.sql          # Database schema
├── test/test-api.js             # API testing
├── docs/DEPLOYMENT.md           # Detailed deployment guide
├── package.json                 # Dependencies
├── vercel.json                  # Vercel config
└── README.md                    # Full documentation
```

## 🎯 Key Functions

### API Endpoint: `/api/ask`
- **Method**: POST
- **Input**: `{"userInput": "string", "sessionId": "string"}`
- **Output**: `{"response": "SSML", "sessionId": "string"}`

### Voice Characters
- **Joanna**: Main narration
- **Matthew**: Military NPCs
- **Ivy**: Creepy/alien voices
- **Justin**: Computer/AI systems

### LLM Integration
- **OpenAI**: GPT-4o for dynamic responses
- **OpenAI**: GPT-4o support
- **Switch**: Set `LLM_PROVIDER=openai` in environment

## 🔧 Environment Variables

```env
# Required
LLM_PROVIDER=openai
OPENAI_API_KEY=your_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_key

# Optional
OPENAI_API_KEY=your_key  # If using OpenAI
DEBUG=false
```

## 🧪 Testing

### Test API Locally
```bash
npm run dev
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"userInput": "open the door"}'
```

### Test with Alexa
1. "Alexa, open Bug Hunt"
2. "Check the medbay"
3. "Search for survivors"

## 📊 Monitoring

### Vercel Logs
```bash
npx vercel logs
```

### Supabase Analytics
```sql
-- Recent sessions
SELECT * FROM logs ORDER BY created_at DESC LIMIT 10;

-- Session summaries  
SELECT * FROM session_summaries;
```

## 🛠️ Troubleshooting

### Common Issues

1. **Alexa not responding**
   - Check endpoint URL in skill config
   - Verify SSL certificate
   - Test API directly with curl

2. **LLM timeouts**
   - Check API key validity
   - Monitor Vercel function logs
   - Increase timeout in Lambda

3. **Supabase errors**
   - Verify table exists: `SELECT * FROM logs;`
   - Check API key permissions
   - Test REST API directly

4. **SSML issues**
   - Ensure proper voice name formatting
   - Check for malformed XML
   - Test with simple responses first

### Debug Commands

```bash
# Test environment variables
node test/test-api.js

# Check Vercel deployment
npx vercel ls

# Test Supabase connection
curl -X POST https://your-project.supabase.co/rest/v1/logs \
  -H "Authorization: Bearer your_key" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test", "prompt": "test", "response": "test"}'
```

## 📞 Support

- **Documentation**: See `README.md` for full details
- **Deployment**: See `docs/DEPLOYMENT.md` for step-by-step guide
- **Testing**: Use `test/test-api.js` for API validation
- **Issues**: Check Vercel logs and Supabase dashboard

## 🎮 Game Commands

Try these voice commands:
- "Open the door"
- "Check the medbay" 
- "Search for survivors"
- "Look around"
- "Check the computer"
- "Go to the bridge"

## 📈 Performance Tips

- Keep responses under 8 seconds
- Limit SSML to 750 characters
- Use session IDs for tracking
- Monitor Supabase for analytics
- Test with physical Alexa devices

---

**Version**: 1.0.0  
**Status**: Ready for Production  
**Last Updated**: 2025-07-10 