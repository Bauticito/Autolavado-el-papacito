var visits = [];

export default async function handler(req) {
  var now = Date.now();
  var oneHourAgo = now - 3600000;
  visits = visits.filter(function(v){ return v.ts > oneHourAgo; });

  return new Response(JSON.stringify({ count: visits.length, threshold: 50, alert: visits.length >= 50 }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
  });
}
