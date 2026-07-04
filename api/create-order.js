// POST /api/create-order
// Body: { productId, quantity }
// Prices the order AUTHORITATIVELY from the server-side catalog, then creates a
// PayPal order and returns its id. The browser never sends an amount.

import { getProduct } from "../data/catalog.js";
import { PAYPAL_BASE, getAccessToken, readJson, paypalConfigured } from "./_paypal.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!paypalConfigured()) {
    return res.status(503).json({ error: "Payments are not configured yet." });
  }

  try {
    const { productId, quantity } = await readJson(req);
    const product = getProduct(productId);
    if (!product) return res.status(400).json({ error: "Unknown product." });

    const qty = Math.max(1, Math.min(20, parseInt(quantity, 10) || 1));
    const unit = Number(product.price).toFixed(2);
    const total = (Number(product.price) * qty).toFixed(2);

    const token = await getAccessToken();
    const order = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: `${product.name} — Saint Elias`.slice(0, 127),
            amount: {
              currency_code: "USD",
              value: total,
              breakdown: {
                item_total: { currency_code: "USD", value: total },
              },
            },
            items: [
              {
                name: product.name.slice(0, 127),
                quantity: String(qty),
                unit_amount: { currency_code: "USD", value: unit },
                category: "DIGITAL_GOODS",
              },
            ],
          },
        ],
        application_context: {
          brand_name: "Saint Elias Orthodox Church",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
        },
      }),
    });

    const data = await order.json();
    if (!order.ok) {
      console.error("PayPal create order error:", data);
      return res.status(502).json({ error: "Could not start checkout." });
    }
    return res.status(200).json({ id: data.id });
  } catch (err) {
    console.error("create-order failed:", err);
    return res.status(500).json({ error: "Server error creating order." });
  }
}
