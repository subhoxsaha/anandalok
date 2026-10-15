export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let orderId = req.query?.orderId;
    if (!orderId && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      orderId = body.orderId;
    }

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
    const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
    const CASHFREE_ENV = (process.env.CASHFREE_ENV || 'production').toLowerCase();
    const CASHFREE_API_VERSION = '2023-08-01';

    const CASHFREE_API_BASE = CASHFREE_ENV === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

    const headers = {
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': CASHFREE_API_VERSION,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const encodedId = encodeURIComponent(orderId);

    // 1. Fetch Order Details
    const orderRes = await fetch(`${CASHFREE_API_BASE}/orders/${encodedId}`, {
      method: 'GET',
      headers,
    });
    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      return res.status(orderRes.status).json({
        error: orderData.message || 'Failed to query Cashfree order',
        details: orderData,
      });
    }

    // 2. Fetch Payment Attempts
    let payments: any[] = [];
    try {
      const paymentsRes = await fetch(`${CASHFREE_API_BASE}/orders/${encodedId}/payments`, {
        method: 'GET',
        headers,
      });
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        if (Array.isArray(paymentsData)) {
          payments = paymentsData;
        }
      }
    } catch {}

    const isOrderPaid = orderData.order_status === 'PAID';
    const latestPayment = payments.length > 0 ? payments[payments.length - 1] : null;

    let isPaid = isOrderPaid;
    let status = orderData.order_status;
    let failureReason: string | undefined = undefined;

    if (latestPayment) {
      const payStatus = latestPayment.payment_status;
      if (payStatus === 'SUCCESS') {
        isPaid = true;
        status = 'PAID';
      } else if (payStatus === 'FAILED') {
        isPaid = false;
        status = 'FAILED';
        failureReason = latestPayment.error_details?.error_description ||
                        latestPayment.payment_message ||
                        'Transaction was declined or failed by bank.';
      } else if (payStatus === 'USER_DROPPED') {
        isPaid = false;
        status = 'USER_DROPPED';
        failureReason = 'Payment was abandoned or closed before completion.';
      } else if (payStatus === 'CANCELLED') {
        isPaid = false;
        status = 'CANCELLED';
        failureReason = 'Payment was cancelled.';
      } else if (payStatus === 'PENDING') {
        isPaid = false;
        status = 'PENDING';
        failureReason = 'Payment is currently pending bank clearance.';
      }
    } else if (!isOrderPaid) {
      failureReason = 'No completed payment received for this active order.';
    }

    return res.status(200).json({
      success: true,
      orderId: orderData.order_id,
      cfOrderId: orderData.cf_order_id,
      orderStatus: status,
      rawOrderStatus: orderData.order_status,
      paid: isPaid,
      amount: orderData.order_amount,
      currency: orderData.order_currency,
      cfPaymentId: latestPayment?.cf_payment_id || undefined,
      bankReference: latestPayment?.bank_reference || undefined,
      paymentMethod: latestPayment?.payment_group || undefined,
      paymentMessage: latestPayment?.payment_message || undefined,
      failureReason: isPaid ? undefined : failureReason,
      paymentsCount: payments.length,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal error verifying order' });
  }
}
