export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-analytics-pass');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const pass = req.headers['x-analytics-pass'];
  if (pass !== process.env.ANALYTICS_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  const days = parseInt(req.query.days) || 30;

  try {
    const [analyticsRes, visitsRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/rpc/get_analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
        body: JSON.stringify({ days_back: days }),
      }),
      fetch(`${supabaseUrl}/rest/v1/rpc/get_recent_visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
        body: JSON.stringify({ days_back: days, max_rows: 200 }),
      }),
    ]);

    if (!analyticsRes.ok) {
      const text = await analyticsRes.text();
      return res.status(500).json({ error: text });
    }

    const data = await analyticsRes.json();
    const visits = visitsRes.ok ? await visitsRes.json() : [];
    return res.status(200).json({ days, ...data, recentVisits: visits });
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
