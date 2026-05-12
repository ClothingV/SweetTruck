export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ days_back: 30 }),
    });

    const text = await response.text();
    res.status(200).json({
      supabaseStatus: response.status,
      supabaseResponse: text,
      keyPrefix: supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'MISSING',
      url: supabaseUrl,
    });
  } catch (err) {
    res.status(200).json({ error: err.message });
  }
}
