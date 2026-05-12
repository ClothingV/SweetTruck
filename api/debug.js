export default async function handler(req, res) {
  res.status(200).json({
    hasPassword: !!process.env.ANALYTICS_PASSWORD,
    passwordLength: (process.env.ANALYTICS_PASSWORD || '').length,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
  });
}
