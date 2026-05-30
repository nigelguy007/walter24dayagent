# Kirkland Campaign HQ — Complete Package
**bagofagents.com | Walter Kirkland for Congress MD-5 2026**

---

## What's Included

| File | Purpose |
|------|---------|
| `index.html` | Complete single-file web app — upload to GitHub Pages |
| `rapid-handler-edge-function.ts` | Supabase Edge Function — handles Claude + ChatGPT Images 2.0 + Facebook/Instagram posting |
| `README.md` | This file |
| `DEPLOYMENT.md` | Step-by-step deployment guide |
| `SQL_SETUP.sql` | All Supabase database tables needed |

---

## Stack
- **Frontend**: Single HTML file (no build tools, no npm)
- **Hosting**: GitHub Pages → bagofagents.com (Cloudflare DNS)
- **Database**: Supabase (messages, campaign_context, platform_settings, scheduled_posts)
- **AI**: Claude Sonnet 4 via Supabase Edge Function proxy
- **Images**: OpenAI gpt-image-2 (ChatGPT Images 2.0) via same proxy
- **Social Posting**: Meta Graph API v19.0 (Facebook + Instagram)

---

## Features Built
1. **8 AI Campaign Agents** — Campaign Strategist, Content Engine, Paid Ads, Outreach, Competitor Intel, Voter Targeting, Events & Ground, Digital Optimizer
2. **3 Button Types** — White (expert analysis), Gold ⚡ (Call To Action), Blue 🔍 (live internet research)
3. **Live Web Search** — blue buttons search internet for latest Walter/MD-5 news + winning political tactics
4. **Content Studio** — Create posts, stories, reels with ChatGPT Images 2.0
5. **5-Slide Reel Generator** — PAS copywriting framework, narrative arc, gpt-image-2 text-in-image
6. **Auto-Posting** — Facebook and Instagram via Meta Graph API
7. **Smart Scheduling** — Best time engine (federal workers + Black voters PGC audience)
8. **Settings Panel** — Secure credential storage in Supabase
9. **Google Drive Sync** — Reads Walter's election drive folder, injects into all agents
10. **Team Login** — Nigel, Eva, Karen, Walter — shared live database
11. **Countdown Timers** — Days to early voting + primary in header

---

## Credentials Needed (add to Supabase Secrets)
| Secret Name | Value |
|-------------|-------|
| `ANTHROPIC_KEY` | sk-ant-... (from console.anthropic.com) |
| `OPENAI_KEY` | sk-... (from platform.openai.com) |

---

## Platform Credentials (add in app Settings ⚙️)
| Field | Where to get |
|-------|-------------|
| Facebook Page ID | Facebook Page → About → Page ID |
| Facebook Page Access Token | developers.facebook.com → Graph API Explorer |
| Instagram Business Account ID | Graph API: GET /{page-id}?fields=instagram_business_account |

