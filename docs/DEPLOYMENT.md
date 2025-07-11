# Deployment Guide - Bug Hunt Alexa Skill

This guide walks you through deploying the Bug Hunt TTRPG voice assistant to production.

## 🚀 Prerequisites

Before starting, ensure you have:

- [Node.js 18+](https://nodejs.org/)
- [Vercel CLI](https://vercel.com/cli)
- [Supabase account](https://supabase.com/)
- [Amazon Developer account](https://developer.amazon.com/)
- API keys for your chosen LLM provider

## 📋 Step-by-Step Deployment

### 1. Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd bug_hunt
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp env.example .env.local
   ```

4. **Configure environment variables:**
   Edit `.env.local` with your actual API keys:
   ```env
   LLM_PROVIDER=openai
OPENAI_API_KEY=your_actual_openai_key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_actual_supabase_key
   ```

### 2. Supabase Setup

1. **Create Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Run database schema:**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the contents of `supabase/schema.sql`
   - Execute the SQL

3. **Verify table creation:**
   ```sql
   SELECT * FROM logs LIMIT 1;
   ```

### 3. Vercel Deployment

1. **Login to Vercel:**
   ```bash
   npx vercel login
   ```

2. **Deploy to Vercel:**
   ```bash
   npx vercel --prod
   ```

3. **Set environment variables in Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add all variables from your `.env.local`

4. **Get your deployment URL:**
   - Note the URL from the deployment output
   - Format: `https://your-project.vercel.app`

### 4. Alexa Skill Configuration

1. **Create Alexa Skill:**
   - Go to [Amazon Developer Console](https://developer.amazon.com/alexa)
   - Click "Create Skill"
   - Choose "Custom" model
   - Name: "Bug Hunt"

2. **Configure Interaction Model:**
   - Go to "Interaction Model" → "JSON Editor"
   - Replace with contents of `alexa-skill/skill.json`
   - Update the endpoint URL to your Vercel deployment

3. **Configure Endpoint:**
   - Go to "Endpoint" section
   - Select "HTTPS"
   - Enter your Vercel URL: `https://your-project.vercel.app/api/ask`
   - Select "My development endpoint is a sub-domain of a domain that has a wildcard certificate"

4. **Test the Skill:**
   - Use the Alexa Developer Console simulator
   - Test with: "Alexa, open Bug Hunt"
   - Then: "Check the medbay"

### 5. SSL Certificate Verification

1. **Verify SSL:**
   ```bash
   curl -I https://your-project.vercel.app/api/ask
   ```

2. **Test CORS:**
   ```bash
   curl -X OPTIONS https://your-project.vercel.app/api/ask \
     -H "Origin: https://developer.amazon.com" \
     -H "Access-Control-Request-Method: POST"
   ```

### 6. Production Testing

1. **Test API directly:**
   ```bash
   curl -X POST https://your-project.vercel.app/api/ask \
     -H "Content-Type: application/json" \
     -d '{"userInput": "open the door", "sessionId": "test-123"}'
   ```

2. **Test with Alexa device:**
   - Enable the skill on your Alexa device
   - Say: "Alexa, open Bug Hunt"
   - Test various commands

3. **Monitor logs:**
   - Check Vercel function logs
   - Verify Supabase logging is working

## 🔧 Troubleshooting

### Common Issues

1. **Alexa not responding:**
   - Check endpoint URL is correct
   - Verify SSL certificate is valid
   - Test API directly with curl

2. **LLM timeouts:**
   - Increase timeout in Lambda function
   - Check API key validity
   - Monitor Vercel function logs

3. **Supabase errors:**
   - Verify table exists: `SELECT * FROM logs;`
   - Check API key permissions
   - Test REST API directly

4. **SSML issues:**
   - Ensure proper voice name formatting
   - Check for malformed XML
   - Test with simple responses first

### Debug Commands

```bash
# Test API locally
npm run dev
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"userInput": "test"}'

# Check Vercel logs
npx vercel logs

# Test Supabase connection
curl -X POST https://your-project.supabase.co/rest/v1/logs \
  -H "Authorization: Bearer your_key" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test", "prompt": "test", "response": "test"}'
```

## 📊 Monitoring

### Vercel Monitoring

1. **Function logs:**
   - Go to Vercel dashboard
   - Click on your project
   - Navigate to Functions tab

2. **Performance metrics:**
   - Monitor execution time
   - Check error rates
   - Review cold start performance

### Supabase Monitoring

1. **Database logs:**
   ```sql
   -- Recent activity
   SELECT * FROM logs ORDER BY created_at DESC LIMIT 10;
   
   -- Session summaries
   SELECT * FROM session_summaries;
   ```

2. **API usage:**
   - Check Supabase dashboard
   - Monitor API request counts
   - Review error logs

## 🔄 Updates and Maintenance

### Updating the Skill

1. **Deploy backend changes:**
   ```bash
   npx vercel --prod
   ```

2. **Update Alexa skill:**
   - Modify `alexa-skill/skill.json`
   - Re-upload to Amazon Developer Console

3. **Test thoroughly:**
   - Use Alexa Developer Console
   - Test with physical devices
   - Monitor for errors

### Environment Updates

1. **Update Vercel environment:**
   - Go to Vercel dashboard
   - Settings → Environment Variables
   - Add/update variables

2. **Redeploy if needed:**
   ```bash
   npx vercel --prod
   ```

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Supabase database schema applied
- [ ] Vercel deployment successful
- [ ] SSL certificate valid
- [ ] Alexa skill configured and tested
- [ ] API endpoints responding correctly
- [ ] Logging working in Supabase
- [ ] Error handling implemented
- [ ] Performance monitoring set up
- [ ] Documentation updated

## 📞 Support

For deployment issues:

1. Check Vercel function logs
2. Verify Supabase connectivity
3. Test API endpoints directly
4. Review Alexa skill configuration
5. Check environment variables

Remember to keep your API keys secure and never commit them to version control! 