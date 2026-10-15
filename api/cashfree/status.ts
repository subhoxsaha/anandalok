export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
  const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
  const CASHFREE_ENV = (process.env.CASHFREE_ENV || 'production').toLowerCase();

  return res.status(200).json({
    configured: Boolean(CASHFREE_APP_ID && CASHFREE_SECRET_KEY),
    mode: CASHFREE_ENV,
    gateway: 'Cashfree Payments',
    singular: true,
  });
}
