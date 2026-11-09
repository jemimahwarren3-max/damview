# Paynow setup (not yet live)

The official `paynow` npm SDK is installed and `lib/paynow.ts` /
`app/api/payments/*` are written against it, but nothing works until you:

1. **Create a Paynow merchant account** at [paynow.co.zw](https://www.paynow.co.zw) —
   this is a real business account, only you can create it (needs business
   registration details).
2. **Generate an integration ID and key** from the Paynow merchant dashboard
   (Paynow's own docs: "Generating Integration Key" / "Viewing integration ID").
   New integrations start in **test mode** — you need at least one successful
   test transaction before Paynow will approve going live.
3. Set two environment variables (never commit these):
   ```
   PAYNOW_INTEGRATION_ID=...
   PAYNOW_INTEGRATION_KEY=...
   ```
4. That's it on the code side — `lib/paynow.ts` picks them up automatically.

## What's built

- `lib/paynow.ts` — `initiateWebPayment()` (redirect to Paynow's hosted page),
  `initiateMobilePayment()` (EcoCash/OneMoney USSD push), `checkPaymentStatus()`.
- `app/api/payments/initiate/route.ts` — POST endpoint that starts a payment.
- `app/api/payments/webhook/route.ts` — Paynow's result callback. Re-verifies
  status by polling Paynow directly rather than trusting the webhook's hash,
  since Paynow's own documentation gives two different, inconsistent hash
  field lists depending on integration type — safer not to guess at a
  payment-verification signature check.

## What's still missing

- **Nothing to attach a payment to yet.** Bookings, enquiries and invoices
  are still mock data (`lib/data/*.ts`) — there's no real record to mark
  "paid" until Stage 10's Supabase backend exists. Wire that up first.
- **No "Pay Now" button anywhere in the UI yet** — deliberately, since a pay
  button needs a real booking/invoice to pay against.
- EcoCash/OneMoney are the only mobile money methods Paynow's SDK documents;
  card payments go through the hosted web checkout (`initiateWebPayment`).
