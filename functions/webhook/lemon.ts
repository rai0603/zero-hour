interface Env {
  LEMON_WEBHOOK_SECRET: string
  LEMON_PRODUCT_ID: string
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context
  const body = await request.text()
  const signature = request.headers.get('X-Signature') ?? ''

  // Verify HMAC-SHA256 signature
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(env.LEMON_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sigBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  const expected = Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  if (expected !== signature) {
    return new Response('Unauthorized', { status: 401 })
  }

  const payload = JSON.parse(body)
  const eventName = payload.meta?.event_name

  if (eventName !== 'order_created') {
    return new Response('OK', { status: 200 })
  }

  const productId = String(payload.data?.attributes?.first_order_item?.product_id ?? '')
  if (productId !== env.LEMON_PRODUCT_ID) {
    return new Response('OK', { status: 200 })
  }

  const email: string = payload.data?.attributes?.user_email ?? ''
  if (!email) {
    return new Response('No email', { status: 400 })
  }

  const supabaseUrl = env.SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

  // Find Supabase user by email
  const userRes = await fetch(
    `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}&page=1&per_page=1`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } }
  )
  const userData = await userRes.json() as { users?: { id: string }[] }
  const userId = userData.users?.[0]?.id

  if (!userId) {
    // User hasn't registered yet; nothing to do for now
    return new Response('User not found', { status: 200 })
  }

  // Upsert pdf_unlocked = true in zerohour_profiles
  await fetch(`${supabaseUrl}/rest/v1/zerohour_profiles`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ user_id: userId, pdf_unlocked: true }),
  })

  return new Response('OK', { status: 200 })
}
