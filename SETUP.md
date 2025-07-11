# 🚀 Bug Hunt API Setup Guide

## Quick Fix for 400 Errors

The 400 errors you're experiencing are likely due to missing environment variables. Follow these steps:

### 1. Create Environment File

```bash
cp env.example .env.local
```

### 2. Configure API Keys

Edit `.env.local` and add your API keys:

```env
# LLM Configuration
LLM_PROVIDER=openai

# OpenAI Configuration (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-openai-api-key-here



# Supabase Configuration (optional for logging)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Debug mode
DEBUG=false
```

### 3. Test Your Setup

```bash
# Start the server
npm run dev

# In another terminal, run the debug script
node test/debug-400.js
```

## Common 400 Error Causes

### ❌ Missing API Keys
- **Error**: "OpenAI API key not configured"
- **Fix**: Add `OPENAI_API_KEY`

### ❌ Invalid Request Body
- **Error**: "userInput is required"
- **Fix**: Ensure your POST request includes `{"userInput": "your text"}`

### ❌ Wrong Content-Type
- **Error**: "Invalid request body"
- **Fix**: Set header `Content-Type: application/json`

### ❌ Malformed JSON
- **Error**: "Invalid JSON in request body"
- **Fix**: Check your JSON syntax

## Testing Your API

### Using curl:
```bash
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"userInput": "open the door", "sessionId": "test-123"}'
```

### Using the test script:
```bash
node test/test-api.js
```

### Using the debug script:
```bash
node test/debug-400.js
```

## Environment Variables Explained

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `LLM_PROVIDER` | No | `openai` (defaults to `openai`) |
| `SUPABASE_URL` | No | For logging requests |
| `SUPABASE_ANON_KEY` | No | For logging requests |
| `DEBUG` | No | Enable detailed logging |

## Troubleshooting

### Still getting 400 errors?

1. **Check your environment variables**:
   ```bash
   node -e "console.log('OpenAI:', process.env.OPENAI_API_KEY ? 'Set' : 'Missing')"
   ```

2. **Test with the debug script**:
   ```bash
   node test/debug-400.js
   ```

3. **Check server logs**:
   ```bash
   npm run dev
   # Look for error messages in the console
   ```

4. **Verify your request format**:
   ```json
   {
     "userInput": "your command here",
     "sessionId": "optional-session-id"
   }
   ```

### Getting 500 errors?

This usually means your API keys are invalid or the LLM service is down. Check:
- API key validity
- Network connectivity
- LLM service status

## Deployment Notes

For Vercel deployment, add your environment variables in the Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable from your `.env.local` file 