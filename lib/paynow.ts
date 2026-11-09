import "server-only";
import { Paynow } from "paynow";

export interface PaynowLineItem {
  description: string;
  amount: number;
}

/**
 * Not usable until PAYNOW_INTEGRATION_ID / PAYNOW_INTEGRATION_KEY are set
 * (real Paynow merchant account, created by the business owner at
 * paynow.co.zw — see docs/paynow.md). Throws clearly instead of silently
 * no-op-ing if called before that's configured.
 */
function getPaynowClient(resultUrl: string, returnUrl: string) {
  const integrationId = process.env.PAYNOW_INTEGRATION_ID;
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY;

  if (!integrationId || !integrationKey) {
    throw new Error(
      "Paynow is not configured — set PAYNOW_INTEGRATION_ID and PAYNOW_INTEGRATION_KEY. See docs/paynow.md."
    );
  }

  const paynow = new Paynow(integrationId, integrationKey);
  paynow.resultUrl = resultUrl;
  paynow.returnUrl = returnUrl;
  return paynow;
}

/** Standard web checkout — redirects the guest to Paynow's hosted payment page. */
export async function initiateWebPayment(params: {
  reference: string;
  items: PaynowLineItem[];
  resultUrl: string;
  returnUrl: string;
}) {
  const paynow = getPaynowClient(params.resultUrl, params.returnUrl);
  const payment = paynow.createPayment(params.reference);
  for (const item of params.items) {
    payment.add(item.description, item.amount);
  }
  return paynow.send(payment);
}

/** Mobile money checkout (EcoCash / OneMoney) — pushes a USSD prompt to the guest's phone. */
export async function initiateMobilePayment(params: {
  reference: string;
  items: PaynowLineItem[];
  phone: string;
  method: "ecocash" | "onemoney";
  resultUrl: string;
  returnUrl: string;
}) {
  const paynow = getPaynowClient(params.resultUrl, params.returnUrl);
  const payment = paynow.createPayment(params.reference);
  for (const item of params.items) {
    payment.add(item.description, item.amount);
  }
  return paynow.sendMobile(payment, params.phone, params.method);
}

export async function checkPaymentStatus(pollUrl: string) {
  const paynow = getPaynowClient("", "");
  return paynow.pollTransaction(pollUrl);
}
