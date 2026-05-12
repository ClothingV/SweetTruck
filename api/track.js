export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { path, referrer, section, duration_seconds } = req.body || {};
  if (!path) return res.status(400).json({ error: 'path required' });

  const ua = req.headers['user-agent'] || '';
  const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop';
  const browser = parseBrowser(ua);
  const countryCode = req.headers['x-vercel-ip-country'] || '';
  const country = countryNames[countryCode] || countryCode || 'Unbekannt';

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/page_views`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ path, referrer: referrer || null, user_agent: ua, device, browser, country, section: section || null, duration_seconds: duration_seconds || null }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: text });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

const countryNames = {
  DE: 'Deutschland', AT: 'Österreich', CH: 'Schweiz', LI: 'Liechtenstein',
  FR: 'Frankreich', IT: 'Italien', ES: 'Spanien', PT: 'Portugal',
  NL: 'Niederlande', BE: 'Belgien', LU: 'Luxemburg',
  GB: 'Großbritannien', IE: 'Irland', US: 'USA', CA: 'Kanada',
  PL: 'Polen', CZ: 'Tschechien', SK: 'Slowakei', HU: 'Ungarn',
  DK: 'Dänemark', SE: 'Schweden', NO: 'Norwegen', FI: 'Finnland',
  GR: 'Griechenland', TR: 'Türkei', RU: 'Russland', UA: 'Ukraine',
  RO: 'Rumänien', BG: 'Bulgarien', HR: 'Kroatien', SI: 'Slowenien',
  RS: 'Serbien', BA: 'Bosnien', AL: 'Albanien', MK: 'Nordmazedonien',
  JP: 'Japan', CN: 'China', KR: 'Südkorea', IN: 'Indien',
  AU: 'Australien', NZ: 'Neuseeland', BR: 'Brasilien', MX: 'Mexiko',
  AR: 'Argentinien', CL: 'Chile', CO: 'Kolumbien',
  ZA: 'Südafrika', EG: 'Ägypten', MA: 'Marokko',
  AE: 'Ver. Arabische Emirate', SA: 'Saudi-Arabien', IL: 'Israel',
  TH: 'Thailand', VN: 'Vietnam', PH: 'Philippinen', ID: 'Indonesien',
  MY: 'Malaysia', SG: 'Singapur', TW: 'Taiwan',
};

function parseBrowser(ua) {
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return 'Chrome';
  if (/Firefox/i.test(ua)) return 'Firefox';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  if (/MSIE|Trident/i.test(ua)) return 'IE';
  return 'Other';
}
