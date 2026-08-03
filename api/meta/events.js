var META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
var META_PIXEL_ID = process.env.META_PIXEL_ID || '1309829625537659';
var META_API_VERSION = 'v18.0';
var META_API = 'https://graph.facebook.com/' + META_API_VERSION;

module.exports = async function handler(req, res) {
  if (!META_ACCESS_TOKEN) {
    return res.status(200).json({ ok: false, reason: 'META_ACCESS_TOKEN not set' });
  }

  try {
    var body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    var eventName = body.event || 'page_view';
    var detail = body.detail || '';
    var sourceUrl = body.url || 'https://autolavado-el-papacito.vercel.app';
    var eventTime = Math.floor(Date.now() / 1000);

    var userData = {
      client_ip_address: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '',
      client_user_agent: req.headers['user-agent'] || ''
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

    var metaRes = await fetch(META_API + '/' + META_PIXEL_ID + '/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + META_ACCESS_TOKEN
      },
      body: JSON.stringify(payload)
    });

    var result = await metaRes.json();
    res.status(200).json({ ok: true, meta: result });
  } catch (e) {
    res.status(200).json({ ok: false, error: e.message });
  }
};
