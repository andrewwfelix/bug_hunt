# Vercel Serverless Best Practices for Node.js (Alexa TTRPG Integration)

This document summarizes best practices for deploying Node.js serverless functions on Vercel, specifically for your Alexa-integrated TTRPG application.

---

## 1. Project Structure

```
my-alexa-ttrpg-project/
├── api/
│   └── ask.js              ← serverless function
├── supabase/
│   └── schema.sql
├── package.json
├── vercel.json
├── .env
├── .env.example
└── README.md
```

> `api/ask.js` will be deployed as `https://your-project.vercel.app/api/ask`

---

## 2. Example api/ask.js (Serverless Format)

```js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { sessionId, userInput } = req.body;

  // TODO: Add LLM call and Supabase logging here

  const ssmlResponse = `
    <speak>
      <voice name="Joanna">Scanning the garage... something moves.</voice>
    </speak>
  `;

  return res.status(200).json({
    version: "1.0",
    response: {
      outputSpeech: {
        type: "SSML",
        ssml: ssmlResponse
      },
      shouldEndSession: false
    }
  });
}
```

---

## 3. vercel.json (Configuration File)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "functions": {
    "api/ask.js": {
      "maxDuration": 30
    }
  }
}
```

---

## 4. Environment Variables

### Local Development (.env.local)
```env
OPENAI_API_KEY=your_openai_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
LLM_PROVIDER=openai
```

### Vercel Dashboard
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable from your `.env.local`

---

## 5. Package.json Requirements

```json
{
  "name": "bug-hunt-alexa-backend",
  "version": "1.0.0",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "openai": "^4.20.1",
    "axios": "^1.6.0"
  }
}
```

---

## 6. Common Issues & Solutions

### Issue: 404 Errors
**Cause**: Function not properly exported or wrong file structure
**Solution**: 
- Use `export default function handler(req, res)` 
- Ensure file is in `api/` directory
- Check `vercel.json` configuration

### Issue: Environment Variables Not Working
**Cause**: Variables not set in Vercel dashboard
**Solution**:
- Add variables in Vercel project settings
- Redeploy after adding variables
- Use `process.env.VARIABLE_NAME` to access

### Issue: Function Timeout
**Cause**: LLM calls taking too long
**Solution**:
- Set `maxDuration` in `vercel.json`
- Implement request caching
- Use streaming responses

---

## 7. Testing Locally

```bash
# Install Vercel CLI
npm i -g vercel

# Test locally
vercel dev

# Deploy
vercel --prod
```

---

## 8. Alexa Integration Format

Your serverless function should return Alexa-compatible JSON:

```js
return res.status(200).json({
  version: "1.0",
  response: {
    outputSpeech: {
      type: "SSML",
      ssml: "<speak><voice name=\"Joanna\">Response here</voice></speak>"
    },
    shouldEndSession: false
  }
});
```

---

## 9. Best Practices

1. **Keep functions small**: One function per endpoint
2. **Handle errors gracefully**: Always return proper HTTP status codes
3. **Use environment variables**: Never hardcode secrets
4. **Test locally first**: Use `vercel dev` before deploying
5. **Monitor logs**: Check Vercel function logs for debugging
6. **Set timeouts**: Configure `maxDuration` for long-running operations

---

## 10. Deployment Checklist

- [ ] Functions use `export default function handler(req, res)`
- [ ] Environment variables set in Vercel dashboard
- [ ] `vercel.json` properly configured
- [ ] `package.json` has correct dependencies
- [ ] Local testing with `vercel dev` passes
- [ ] Function logs checked for errors

---

## 11. Troubleshooting Commands

```bash
# Check function logs
vercel logs

# Redeploy with fresh cache
vercel --prod --force

# Test specific function
curl -X POST https://your-project.vercel.app/api/ask \
  -H "Content-Type: application/json" \
  -d '{"userInput": "test"}'
``` 