var visits = [];

module.exports = async function handler(req, res) {
  var now = Date.now();
  var oneHourAgo = now - 3600000;
  visits = visits.filter(function(v){ return v.ts > oneHourAgo; });

  if (req.method === 'POST') {
    visits.push({ ts: now });
  }

  var count = visits.length;
  var alert = count >= 50;

  res.status(200).json({ count: count, alert: alert, threshold: 50 });
};
