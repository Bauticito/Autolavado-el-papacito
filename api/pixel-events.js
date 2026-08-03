export default async function handler(req) {
  var pixelId = process.env.FB_PIXEL_ID;
  var accessToken = process.env.FB_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    return new Response(JSON.stringify({ ok: false, reason: 'FB_PIXEL_ID or FB_ACCESS_TOKEN not set' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    var body = await req.json();
    var now = Math.floor(Date.now() / 1000);
    var url = 'https://graph.facebook.com/v18.0/' + pixelId + '/events?access_token=' + accessToken;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: body.event || 'PageView',
          event_time: now,
          action_source: 'website',
          event_source_url: body.url || 'https://autolavado-el-papacito.vercel.app',
          user_data: {
            client_ip_address: req.headers.get('x-forwarded-for') || '',
            client_user_agent: req.headers.get('user-agent') || ''
          }
        }]
      })
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
