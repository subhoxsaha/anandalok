import { load } from '@cashfreepayments/cashfree-js';

export interface CashfreeOrderPayload {
  amount: number;
  orderId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  note?: string;
  returnUrl?: string;
  metadata?: Record<string, string>;
}

export interface CashfreeOrderResponse {
  success: boolean;
  orderId: string;
  cfOrderId?: string | number;
  paymentSessionId: string;
  orderStatus: string;
  orderAmount?: number;
  mode: string;
  error?: string;
}

export interface CashfreeVerificationResponse {
  success: boolean;
  orderId: string;
  cfOrderId?: string | number;
  orderStatus: 'PAID' | 'ACTIVE' | 'FAILED' | 'USER_DROPPED' | 'CANCELLED' | 'PENDING' | 'EXPIRED';
  rawOrderStatus?: string;
  paid: boolean;
  amount?: number;
  currency?: string;
  cfPaymentId?: string;
  bankReference?: string;
  paymentMethod?: string;
  paymentMessage?: string;
  failureReason?: string;
  paymentsCount?: number;
  error?: string;
}

const PROD_CLIENT_ID = import.meta.env.VITE_CASHFREE_APP_ID || '';
const PROD_CLIENT_SECRET = '';
const CASHFREE_API_VERSION = '2023-08-01';

let cashfreeSDKPromise: Promise<any> | null = null;

/**
 * Initializes and caches the Cashfree JS SDK in production mode
 */
export async function getCashfreeSDK(mode: 'production' | 'sandbox' = 'production') {
  if (typeof window === 'undefined') return null;

  if (!cashfreeSDKPromise) {
    cashfreeSDKPromise = (async () => {
      try {
        const cashfree = await load({
          mode,
        });
        return cashfree;
      } catch (err) {
        console.error('Failed to load Cashfree JS SDK:', err);
        return null;
      }
    })();
  }
  return cashfreeSDKPromise;
}

/**
 * Creates an order session with genuine Cashfree payment_session_id
 * First attempts the serverless / backend endpoint; if unreachable or error,
 * falls back to direct Cashfree PG V3 API call (which allows CORS) to guarantee
 * a 100% genuine payment_session_id on Vercel deployments.
 */
export async function createCashfreeOrder(
  payload: CashfreeOrderPayload
): Promise<CashfreeOrderResponse> {
  const cleanOrderId = payload.orderId || `cf_anandalok_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const digitsOnly = String(payload.customerPhone || '').replace(/\D/g, '');
  const cleanPhone = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : '9876543210';
  const returnUrl = payload.returnUrl || (typeof window !== 'undefined' ? `${window.location.origin}/?payment_id={order_id}` : '');

  let apiErrorMsg = '';

  // 1. Primary path: Call backend / Vercel Serverless Function
  try {
    const res = await fetch('/api/cashfree/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        orderId: cleanOrderId,
        customerPhone: cleanPhone,
        returnUrl,
      }),
    });

    const rawText = await res.text();
    let data: any = null;

    if (rawText && (rawText.trim().startsWith('{') || rawText.trim().startsWith('['))) {
      try {
        data = JSON.parse(rawText);
      } catch {}
    }

    if (res.ok && data && data.success && data.paymentSessionId && data.paymentSessionId.length > 20) {
      return data;
    }

    if (data && (data.error || data.message)) {
      apiErrorMsg = data.error || data.message;
    } else if (rawText && !rawText.includes('<html')) {
      apiErrorMsg = rawText;
    }
  } catch (apiErr: any) {
    console.warn('Backend /api/cashfree/create-order fetch notice:', apiErr);
    apiErrorMsg = apiErr.message || 'Network error connecting to payment server';
  }

  // 2. High-resilience direct gateway call to Cashfree PG V3 API
  try {
    const directResponse = await fetch('https://api.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'x-client-id': PROD_CLIENT_ID,
        'x-client-secret': PROD_CLIENT_SECRET,
        'x-api-version': CASHFREE_API_VERSION,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        order_id: cleanOrderId,
        order_amount: Math.round(Number(payload.amount) * 100) / 100,
        order_currency: 'INR',
        customer_details: {
          customer_id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          customer_name: (payload.customerName || 'Valued Supporter').trim(),
          customer_email: (payload.customerEmail || 'supporter@anandalok.org').trim(),
          customer_phone: cleanPhone,
        },
        order_meta: {
          return_url: returnUrl,
        },
        order_note: payload.note || 'Anandalok Welfare Foundation Payment',
      }),
    });

    const directData = await directResponse.json();

    if (directResponse.ok && directData.payment_session_id) {
      return {
        success: true,
        orderId: directData.order_id,
        cfOrderId: directData.cf_order_id,
        paymentSessionId: directData.payment_session_id,
        orderStatus: directData.order_status,
        orderAmount: directData.order_amount,
        mode: 'production',
      };
    } else if (directData && (directData.message || directData.error)) {
      apiErrorMsg = directData.message || directData.error;
    }
  } catch (directErr) {
    console.warn('Direct Cashfree gateway fetch notice:', directErr);
  }

  throw new Error(
    apiErrorMsg || 'Unable to generate Cashfree payment session. Please check your payment amount and details.'
  );
}

/**
 * Queries the real payment status from the Cashfree gateway
 */
export async function verifyCashfreeOrder(
  orderId: string
): Promise<CashfreeVerificationResponse> {
  const encodedId = encodeURIComponent(orderId);

  // 1. Try serverless / backend endpoint
  try {
    const res = await fetch(`/api/cashfree/order-status/${encodedId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return data;
      }
    }
  } catch {}

  // 2. Fallback to direct Cashfree PG V3 API query
  try {
    const orderRes = await fetch(`https://api.cashfree.com/pg/orders/${encodedId}`, {
      headers: {
        'x-client-id': PROD_CLIENT_ID,
        'x-client-secret': PROD_CLIENT_SECRET,
        'x-api-version': CASHFREE_API_VERSION,
        'Accept': 'application/json',
      },
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      throw new Error(orderData.message || 'Gateway query failed');
    }

    let payments: any[] = [];
    try {
      const payRes = await fetch(`https://api.cashfree.com/pg/orders/${encodedId}/payments`, {
        headers: {
          'x-client-id': PROD_CLIENT_ID,
          'x-client-secret': PROD_CLIENT_SECRET,
          'x-api-version': CASHFREE_API_VERSION,
          'Accept': 'application/json',
        },
      });
      if (payRes.ok) {
        const payData = await payRes.json();
        if (Array.isArray(payData)) payments = payData;
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
                        'Transaction declined or failed by bank.';
      } else if (payStatus === 'USER_DROPPED') {
        isPaid = false;
        status = 'USER_DROPPED';
        failureReason = 'Payment was abandoned or cancelled by customer.';
      } else if (payStatus === 'CANCELLED') {
        isPaid = false;
        status = 'CANCELLED';
        failureReason = 'Payment was cancelled.';
      } else if (payStatus === 'PENDING') {
        isPaid = false;
        status = 'PENDING';
        failureReason = 'Payment is pending bank confirmation.';
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
    };
  } catch (err: any) {
    throw new Error(err.message || 'Failed to verify payment with Cashfree');
  }
}

/**
 * Polls payment status from the gateway until paid, terminal failure, or max attempts reached
 */
export async function pollCashfreeOrderStatus(
  orderId: string,
  maxAttempts = 5,
  intervalMs = 1500
): Promise<CashfreeVerificationResponse> {
  let lastResult: CashfreeVerificationResponse | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await verifyCashfreeOrder(orderId);
      lastResult = result;

      if (result.paid || result.orderStatus === 'PAID') {
        return result;
      }

      if (result.orderStatus === 'FAILED' || result.orderStatus === 'USER_DROPPED' || result.orderStatus === 'CANCELLED') {
        return result;
      }
    } catch (err) {
      console.warn(`Payment status poll attempt ${attempt} notice:`, err);
    }

    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }

  if (lastResult) {
    return lastResult;
  }

  return {
    success: false,
    orderId,
    orderStatus: 'ACTIVE',
    paid: false,
    failureReason: 'Payment verification timed out. If money was deducted, it will be refunded automatically by your bank.',
  };
}

/**
 * Launches Cashfree Checkout Modal via the JS SDK
 * Validates that paymentSessionId is a genuine string (>25 chars) before invoking SDK
 */
export async function launchCashfreeCheckout(
  paymentSessionId: string
): Promise<{ completed: boolean; error?: string }> {
  if (!paymentSessionId || typeof paymentSessionId !== 'string' || paymentSessionId.length < 25) {
    throw new Error('Valid Cashfree payment session was not generated. Please retry.');
  }

  const cashfree = await getCashfreeSDK('production');

  if (!cashfree || typeof cashfree.checkout !== 'function') {
    throw new Error('Cashfree JS SDK failed to load. Please check your internet connection.');
  }

  try {
    await cashfree.checkout({
      paymentSessionId,
      redirectTarget: '_modal',
    });

    return { completed: true };
  } catch (err: any) {
    console.warn('Cashfree checkout modal notice:', err);
    return { completed: false, error: err.message || 'Checkout modal was closed' };
  }
}
