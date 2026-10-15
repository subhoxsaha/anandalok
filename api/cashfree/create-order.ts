export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ success: false, error: 'Invalid JSON request body' });
      }
    }
    body = body || {};

    const {
      orderId,
      amount,
      currency = 'INR',
      customerName = 'Valued Supporter',
      customerEmail = 'supporter@anandalok.org',
      customerPhone = '9876543210',
      note = 'Anandalok Welfare Foundation Payment',
      returnUrl,
    } = body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid positive payment amount is required' });
    }

    const cleanEmail = (customerEmail && typeof customerEmail === 'string' && customerEmail.includes('@'))
      ? customerEmail.trim()
      : 'supporter@anandalok.org';

    // Cashfree Production Credentials
    const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
    const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
    const CASHFREE_ENV = (process.env.CASHFREE_ENV || 'production').toLowerCase();
    const CASHFREE_API_VERSION = '2023-08-01';

    const CASHFREE_API_BASE = CASHFREE_ENV === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

    const cleanOrderId = orderId || `cf_anandalok_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const digitsOnly = String(customerPhone || '').replace(/\D/g, '');
    const cleanPhone = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : '9876543210';
    const cleanCustomerId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const effectiveReturnUrl = returnUrl || `https://anandalok.vercel.app/?payment_id={order_id}`;

    const cfPayload = {
      order_id: cleanOrderId,
      order_amount: Math.round(parsedAmount * 100) / 100,
      order_currency: currency,
      customer_details: {
        customer_id: cleanCustomerId,
        customer_name: (customerName || 'Valued Supporter').trim(),
        customer_email: cleanEmail,
        customer_phone: cleanPhone,
      },
      order_meta: {
        return_url: effectiveReturnUrl,
      },
      order_note: note,
    };

    const response = await fetch(`${CASHFREE_API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'x-api-version': CASHFREE_API_VERSION,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(cfPayload),
    });

    const data = await response.json();

    if (!response.ok || !data.payment_session_id) {
      console.error('Cashfree API error:', response.status, data);
      return res.status(response.status || 400).json({
        success: false,
        error: data.message || 'Cashfree failed to generate payment session ID',
        code: data.code,
        details: data,
      });
    }

    return res.status(200).json({
      success: true,
      orderId: data.order_id,
      cfOrderId: data.cf_order_id,
      paymentSessionId: data.payment_session_id,
      orderStatus: data.order_status,
      orderAmount: data.order_amount,
      mode: CASHFREE_ENV,
    });
  } catch (err: any) {
    console.error('Error in create-order handler:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error creating payment order' });
  }
}

