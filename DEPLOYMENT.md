# Deployment Guide

## Step 1 — Supabase Setup
1. Create project at supabase.com
2. Go to SQL Editor → run SQL_SETUP.sql
3. Go to Edge Functions → Create function named `rapid-handler`
4. Paste contents of `rapid-handler-edge-function.ts` → Deploy
5. Go to Edge Functions → Secrets → Add:
   - `ANTHROPIC_KEY` = your Anthropic API key
   - `OPENAI_KEY` = your OpenAI API key
6. Create Storage bucket called `posts` (set to Public)

## Step 2 — GitHub Pages Setup
1. Create GitHub repository (public)
2. Upload `index.html` to repo root
3. Go to Settings → Pages → Source: main branch
4. Set custom domain if needed

## Step 3 — Update index.html Variables
Open index.html and update these 3 variables near the top of the script:
```javascript
var SB_URL = 'https://YOUR-PROJECT.supabase.co';
var SB_KEY = 'your-supabase-anon-key';
var PROXY_URL = 'https://YOUR-PROJECT.supabase.co/functions/v1/rapid-handler';
```

## Step 4 — DNS (if using custom domain)
Point your domain to GitHub Pages:
- A record: 185.199.108.153
- A record: 185.199.109.153
- A record: 185.199.110.153
- A record: 185.199.111.153

## Step 5 — Google Drive Sync (optional)
1. Open Google Apps Script (script.google.com)
2. Create new project named `CampaignProxy`
3. Add doGet function to read from your Drive folder
4. Deploy as web app (anyone can access)
5. Update APPS_SCRIPT_URL in index.html

## Step 6 — Facebook/Instagram Posting (optional)
1. Go to developers.facebook.com → Create App
2. Add Pages API product
3. Use Graph API Explorer to generate Page Access Token
4. In app: click ⚙️ Settings → enter Page ID + Token → Save

---

## To Reuse For Another Campaign
1. Update the candidate details in the `CTX` variable (search for "WALTER KIRKLAND FOR CONGRESS")
2. Update `TEAM` array with new team names
3. Update `AGENTS` array system prompts with new candidate context
4. Replace logo image URL
5. Change domain/GitHub repo name
