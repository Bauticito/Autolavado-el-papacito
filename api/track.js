var visits = [];

export default async function handler(req) {
  var now = Date.now();
  var oneHourAgo = now - 3600000;
  visits = visits.filter(function(v){ return v.ts > oneHourAgo; });

  if (req.method === 'POST') {
    visits.push({ ts: now });
  }

  var count = visits.length;
  var alert = count >= 50;

  return new Response(JSON.stringify({ count: count, alert: alert, threshold: 50 }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
  });
}
