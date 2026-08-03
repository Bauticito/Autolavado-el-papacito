var META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
var META_PIXEL_ID = process.env.META_PIXEL_ID || '1309829625537659';
var META_API_VERSION = 'v18.0';
var META_API = 'https://graph.facebook.com/' + META_API_VERSION;

export default async function handler(req) {
  if (!META_ACCESS_TOKEN) {
    return new Response(JSON.stringify({ ok: false, reason: 'META_ACCESS_TOKEN not set' }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    var body = await req.json();
    var eventName = body.event || 'page_view';
    var detail = body.detail || '';
    var sourceUrl = body.url || 'https://autolavado-el-papacito.vercel.app';
    var eventTime = Math.floor(Date.now() / 1000);

    var userData = {
      client_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '',
      client_user_agent: req.headers.get('user-agent') || ''
    };

    if (body.email) userData.em = body.email;
    if (body.phone) userData.ph = body.phone;

    var payload = {
      data: [{
        event_name: eventName,
        event_time: eventTime,
        action_source: 'website',
        event_source_url: sourceUrl,
        user_data: userData,
        custom_data: detail ? { content_name: detail } : {}
      }],
      test_event_code: process.env.META_TEST_CODE || undefined
    };

    var res = await fetch(META_API + '/' + META_PIXEL_ID + '/events?access_token=' + META_ACCESS_TOKEN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    var result = await res.json();
    return new Response(JSON.stringify({ ok: true, meta: result }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }
}
