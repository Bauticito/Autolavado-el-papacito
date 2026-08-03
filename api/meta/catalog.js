var META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
var META_PIXEL_ID = process.env.META_PIXEL_ID || '1309829625537659';
var META_API = 'https://graph.facebook.com/v18.0';

export default async function handler(req) {
  if (!META_ACCESS_TOKEN) {
    return new Response(JSON.stringify({ ok: false, reason: 'META_ACCESS_TOKEN not set' }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    var services = [
      { id: 'serv-01', name: 'Lavado a domicilio',   price: '100', currency: 'MXN', availability: 'in stock' },
      { id: 'serv-02', name: 'Lavado on site',       price: '150', currency: 'MXN', availability: 'in stock' },
      { id: 'suc-01',  name: 'Franquicia — sucursal', price: '4000', currency: 'MXN', availability: 'in stock' }
    ];

    var res = await fetch(META_API + '/' + META_PIXEL_ID + '/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + META_ACCESS_TOKEN
      },
      body: JSON.stringify({
        data: services.map(function(s){
          return {
            event_name: 'ViewContent',
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            custom_data: {
              content_ids: [s.id],
              content_name: s.name,
              content_type: 'product',
              currency: s.currency,
              value: parseFloat(s.price),
              availability: s.availability
            }
          };
        })
      })
    });

    var result = await res.json();
    return new Response(JSON.stringify({ ok: true, catalog: services, meta: result }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  }
}
