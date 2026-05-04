export default async function(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  let code = ''
  
  const url = new URL(req.url)
  code = url.searchParams.get('code') || ''
  
  if (!code && req.method === 'POST') {
    try {
      const body = await req.json()
      code = body.code || ''
    } catch {}
  }

  if (!code) {
    return new Response(JSON.stringify({ error: 'Missing code' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }

  const resp = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 
      'Accept': 'application/json', 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      client_id: 'Ov23liQSwMeNgVYkSTr8',
      client_secret: '811d4e10633258cf275e3901e8bafc7943563dc1',
      code
    })
  })

  const data = await resp.json()
  
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  })
}