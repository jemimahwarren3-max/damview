/**
 * The official `paynow` npm package ships no TypeScript declarations
 * (its dist/ is plain compiled JS). This covers only the surface
 * lib/paynow.ts actually uses, per the SDK's documented API.
 */
declare module "paynow" {
  export interface PaynowInitResponse {
    success: boolean;
    error?: string;
    redirectUrl?: string;
    pollUrl?: string;
    instructions?: string;
  }

  export interface PaynowStatusResponse {
    paid(): boolean;
    status: string;
    amount?: number;
    reference?: string;
  }

  export class Payment {
    add(itemName: string, price: number): void;
  }

  export class Paynow {
    constructor(integrationId?: string, integrationKey?: string);
    resultUrl: string;
    returnUrl: string;
    createPayment(reference: string): Payment;
    send(payment: Payment): Promise<PaynowInitResponse>;
    sendMobile(payment: Payment, phone: string, method: "ecocash" | "onemoney"): Promise<PaynowInitResponse>;
    pollTransaction(pollUrl: string): Promise<PaynowStatusResponse>;
  }
}
