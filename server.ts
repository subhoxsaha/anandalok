import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Ensure all /api responses declare application/json content type
app.use('/api', (_req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Graceful JSON parse error handler for requests
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON request payload' });
  }
  next();
});

// Cashfree Production Configuration
const CASHFREE_ENV = (process.env.CASHFREE_ENV || 'production').toLowerCase();
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const CASHFREE_API_VERSION = '2023-08-01';

const CASHFREE_API_BASE = CASHFREE_ENV === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

const getCashfreeHeaders = () => {
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    throw new Error('Cashfree credentials (CASHFREE_APP_ID or CASHFREE_SECRET_KEY) are missing in environment variables.');
  }
  return {
    'x-client-id': CASHFREE_APP_ID,
    'x-client-secret': CASHFREE_SECRET_KEY,
    'x-api-version': CASHFREE_API_VERSION,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
};

// 1. Gateway Status Endpoint
app.get('/api/cashfree/status', (_req, res) => {
  const isConfigured = Boolean(CASHFREE_APP_ID && CASHFREE_SECRET_KEY);
  res.json({
    configured: isConfigured,
    mode: CASHFREE_ENV,
    gateway: 'Cashfree Payments',
    singular: true,
  });
});

// 2. Create Cashfree Order
app.post('/api/cashfree/create-order', async (req, res) => {
  try {
    const {
      orderId,
      amount,
      currency = 'INR',
      customerName = 'Valued Supporter',
      customerEmail = 'supporter@anandalok.org',
      customerPhone = '9876543210',
      note = 'Anandalok Welfare Foundation Payment',
      returnUrl,
    } = req.body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Valid positive payment amount is required' });
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid customer email is required' });
    }

    const headers = getCashfreeHeaders();

    const cleanOrderId = orderId || `cf_anandalok_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cleanPhone = (customerPhone || '9876543210').replace(/\D/g, '').slice(-10) || '9876543210';
    const cleanCustomerId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const effectiveReturnUrl = returnUrl || `https://anandalok.vercel.app/?payment_id={order_id}`;

    const cfPayload = {
      order_id: cleanOrderId,
      order_amount: Math.round(parsedAmount * 100) / 100,
      order_currency: currency,
      customer_details: {
        customer_id: cleanCustomerId,
        customer_name: customerName.trim() || 'Valued Supporter',
        customer_email: customerEmail.trim(),
        customer_phone: cleanPhone,
      },
      order_meta: {
        return_url: effectiveReturnUrl,
      },
      order_note: note,
    };

    const response = await fetch(`${CASHFREE_API_BASE}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(cfPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree API error response:', data);
      return res.status(response.status).json({
        error: data.message || 'Failed to create Cashfree order',
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
    console.error('Server error in /api/cashfree/create-order:', err);
    return res.status(500).json({ error: err.message || 'Internal server error creating Cashfree order' });
  }
});

// Helper to query order and payments from Cashfree directly
async function queryOrderFromCashfree(orderId: string) {
  const headers = getCashfreeHeaders();
  const encodedId = encodeURIComponent(orderId);

  // 1. Fetch Order Details
  const orderRes = await fetch(`${CASHFREE_API_BASE}/orders/${encodedId}`, {
    method: 'GET',
    headers,
  });

  const orderData = await orderRes.json();
  if (!orderRes.ok) {
    throw new Error(orderData.message || `Cashfree order query failed with status ${orderRes.status}`);
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
  } catch (payErr) {
    console.warn('Could not retrieve payment attempts list:', payErr);
  }

  const isOrderPaid = orderData.order_status === 'PAID';
  const latestPayment = payments.length > 0 ? payments[payments.length - 1] : null;

  let isPaid = isOrderPaid;
  let status: 'PAID' | 'ACTIVE' | 'FAILED' | 'USER_DROPPED' | 'CANCELLED' | 'PENDING' | 'EXPIRED' = orderData.order_status;
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

  return {
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
    payments,
  };
}

// 3. Get Order Status Endpoint
app.get('/api/cashfree/order-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID parameter is required' });
    }

    const result = await queryOrderFromCashfree(orderId);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error(`Error checking order status for ${req.params.orderId}:`, err);
    return res.status(500).json({ error: err.message || 'Internal error verifying order status' });
  }
});

// 4. Verify Cashfree Order Endpoint (POST fallback)
app.post('/api/cashfree/verify-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const result = await queryOrderFromCashfree(orderId);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Server error in /api/cashfree/verify-order:', err);
    return res.status(500).json({ error: err.message || 'Internal server error verifying order' });
  }
});

// 5. Cashfree Webhook Listener
app.post('/api/cashfree/webhook', async (req, res) => {
  try {
    const event = req.body;
    console.log('Received Cashfree Webhook event:', event?.type || 'unknown', event?.data?.order?.order_id);
    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Error handling Cashfree webhook:', err);
    return res.status(500).json({ error: 'Webhook processing error' });
  }
});

// Guard against /api requests ever cascading into Vite HTML middleware
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const server = http.createServer(app);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Cashfree Full-Stack server running on port ${PORT} [Mode: ${CASHFREE_ENV}]`);
  });
}

startServer();
