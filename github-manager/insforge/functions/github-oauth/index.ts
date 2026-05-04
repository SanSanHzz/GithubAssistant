import { Context } from '@insforge/shared-schemas'

export async function onRequestPost(ctx: Context): Promise<Response> {
  const { request } = ctx
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return new Response(JSON.stringify({ error: 'Missing code' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const clientId = 'Ov23liQSwMeNgVYkSTr8'
  const clientSecret = '811d4e10633258cf275e3901e8bafc7943563dc1'

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code
    })
  })

  const data = await response.json()

  if (data.error) {
    return new Response(JSON.stringify({ error: data.error_description || data.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}