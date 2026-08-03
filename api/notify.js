export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  var webhookUrl = process.env.NOTIFY_WEBHOOK || '';
  var topic = process.env.NTFY_TOPIC || '';

  try {
    var body = await req.json();
    var evt = body.event || 'click';
    var detail = body.detail || '';
    var ts = new Date();

    if (webhookUrl && webhookUrl.includes('discord.com')) {
      var color = evt === 'slot_click' ? 0xD4AF37 : evt === 'page_view' ? 0x3b82f6 : 0x22c55e;
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '🚗 El Papacito',
            description: evt + (detail ? ' — ' + detail : ''),
            color: color,
            timestamp: ts.toISOString(),
            footer: { text: 'Autolavado Express' }
          }]
        })
      });
    }

    if (topic) {
      await fetch('https://ntfy.sh/' + topic, {
        method: 'POST',
        body: evt + (detail ? ' — ' + detail : ''),
        headers: {
          'Title': '🚗 El Papacito',
          'Tags': 'car',
          'Click': 'https://autolavado-el-papacito.vercel.app'
        }
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}
