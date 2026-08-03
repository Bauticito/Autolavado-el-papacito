var NOTIFY_TOPIC = 'autolavado-ep-9x2z';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    var body = await req.json();
    var evt = body.event || 'click';
    var detail = body.detail || '';
    var ts = body.ts ? new Date(body.ts) : new Date();
    var time = ts.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    var message = evt + (detail ? ' — ' + detail : '') + ' · ' + time;

    var res = await fetch('https://ntfy.sh/' + NOTIFY_TOPIC, {
      method: 'POST',
      body: message,
      headers: {
        'Title': '🚗 El Papacito',
        'Tags': evt === 'slot_click' ? 'star' : 'car',
        'Priority': evt === 'slot_click' ? 'high' : 'default',
        'Click': 'https://autolavado-el-papacito.vercel.app'
      }
    });

    return new Response(JSON.stringify({ ok: true, status: res.status }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}
