// GET /api/config
// Public configuration the browser needs to render the store and PayPal buttons.
// Safe to expose: the PayPal *client id* is public by design; the *secret* is not
// and never appears here.

import { publicCatalog } from "../data/catalog.js";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=60");
  return res.status(200).json({
    paypalClientId: process.env.PAYPAL_CLIENT_ID || null,
    paypalEnv: process.env.PAYPAL_ENV === "live" ? "live" : "sandbox",
    paymentsReady: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
    currency: "USD",
    catalog: publicCatalog(),
  });
}
