// GET /api/ticket-config
// Public configuration the browser needs to render the /tickets page.
// Exposes only the public catalog and whether Stripe is configured — the
// Stripe SECRET key lives only in Vercel env vars and never appears here.

import { publicTickets } from "../data/tickets.js";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=60");
  const key = process.env.STRIPE_SECRET_KEY || "";
  return res.status(200).json({
    ready: Boolean(key),
    // Let the page show a "TEST MODE" banner while we run on test keys.
    testMode: !key || key.startsWith("sk_test_"),
    currency: "USD",
    tickets: publicTickets(),
  });
}
