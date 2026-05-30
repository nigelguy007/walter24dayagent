import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': '*' } })
  }
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Content-Type': 'application/json' }

  try {
    const body = await req.json()
    const anthropicKey = Deno.env.get('ANTHROPIC_KEY')
    const openaiKey = Deno.env.get('OPENAI_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://cmrejjpnfhqmabpwbptb.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_KEY') || Deno.env.get('ANTHROPIC_KEY')

    // ── IMAGE GENERATION (gpt-image-2 / ChatGPT Images 2.0) ──
    if (body.action === 'generateImage') {
      if (!openaiKey) return new Response(JSON.stringify({ error: { message: 'Add OPENAI_KEY to Supabase secrets to enable image generation.' } }), { status: 400, headers: cors })
      const r = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
        body: JSON.stringify({ model: 'gpt-image-2', prompt: body.prompt, size: body.size || '1024x1024', quality: body.quality || 'medium', n: 1 }),
      })
      const data = await r.json()
      return new Response(JSON.stringify(data), { status: 200, headers: cors })
    }

    // ── UPLOAD IMAGE TO SUPABASE STORAGE ──
    if (body.action === 'uploadImage') {
      const base64 = body.base64.replace(/^data:image\/\w+;base64,/, '')
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      const filename = `campaign/${Date.now()}.png`
      const sbUrl = `https://cmrejjpnfhqmabpwbptb.supabase.co/storage/v1/object/public/posts/${filename}`
      const uploadUrl = `https://cmrejjpnfhqmabpwbptb.supabase.co/storage/v1/object/posts/${filename}`
      const r = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'image/png', 'Authorization': `Bearer ${body.sbKey}`, 'apikey': body.sbKey },
        body: bytes
      })
      if (r.ok) {
        return new Response(JSON.stringify({ url: sbUrl }), { status: 200, headers: cors })
      } else {
        const err = await r.text()
        return new Response(JSON.stringify({ error: { message: 'Upload failed: ' + err } }), { status: 400, headers: cors })
      }
    }

    // ── POST TO FACEBOOK PAGE ──
    if (body.action === 'postFacebook') {
      const { pageId, pageToken, message, imageUrl } = body
      let endpoint = `https://graph.facebook.com/v19.0/${pageId}/feed`
      let payload: any = { message, access_token: pageToken }
      if (imageUrl) {
        endpoint = `https://graph.facebook.com/v19.0/${pageId}/photos`
        payload = { caption: message, url: imageUrl, access_token: pageToken }
      }
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await r.json()
      return new Response(JSON.stringify(data), { status: 200, headers: cors })
    }

    // ── POST TO INSTAGRAM ──
    if (body.action === 'postInstagram') {
      const { igAccountId, fbToken, caption, imageUrl } = body
      // Step 1: Create media container
      const r1 = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl, caption, access_token: fbToken })
      })
      const d1 = await r1.json()
      if (!d1.id) return new Response(JSON.stringify({ error: { message: 'Instagram container failed: ' + JSON.stringify(d1) } }), { status: 400, headers: cors })
      // Step 2: Publish
      const r2 = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: d1.id, access_token: fbToken })
      })
      const d2 = await r2.json()
      return new Response(JSON.stringify(d2), { status: 200, headers: cors })
    }

    // ── SAVE SCHEDULED POST ──
    if (body.action === 'saveScheduled') {
      const r = await fetch('https://cmrejjpnfhqmabpwbptb.supabase.co/rest/v1/scheduled_posts', {
        method: 'POST',
        headers: { 'apikey': body.sbKey, 'Authorization': `Bearer ${body.sbKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({ platform: body.platform, caption: body.caption, image_b64: body.image_b64, scheduled_at: body.scheduled_at, status: 'pending', page_id: body.pageId })
      })
      const data = await r.json()
      return new Response(JSON.stringify(data), { status: 200, headers: cors })
    }

    // ── GET SCHEDULED POSTS ──
    if (body.action === 'getScheduled') {
      const r = await fetch('https://cmrejjpnfhqmabpwbptb.supabase.co/rest/v1/scheduled_posts?status=eq.pending&order=scheduled_at.asc', {
        headers: { 'apikey': body.sbKey, 'Authorization': `Bearer ${body.sbKey}` }
      })
      const data = await r.json()
      return new Response(JSON.stringify(data), { status: 200, headers: cors })
    }

    // ── CLAUDE TEXT / CONTENT GENERATION (default) ──
    const requestBody: any = {
      model: body.model || 'claude-sonnet-4-20250514',
      max_tokens: body.max_tokens || 2000,
      system: body.system,
      messages: body.messages,
    }
    if (body.useSearch) {
      requestBody.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }]
    }
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'anthropic-beta': 'web-search-2025-03-05' },
      body: JSON.stringify(requestBody),
    })
    const data = await r.json()
    if (data.content && Array.isArray(data.content)) {
      const txt = data.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n')
      if (txt) data._text = txt
    }
    return new Response(JSON.stringify(data), { status: 200, headers: cors })

  } catch (err) {
    return new Response(JSON.stringify({ error: { message: err.message } }), { status: 500, headers: cors })
  }
})
