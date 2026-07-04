// POST /api/capture-order
// Body: { orderID, productId, quantity, details }
// Captures the PayPal payment, then records the registration to the orders
// webhook (Google Apps Script → Google Sheet + email). Returns a clean result.

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
    const { orderID, productId, quantity, details } = await readJson(req);
    if (!orderID) return res.status(400).json({ error: "Missing orderID." });
    const product = getProduct(productId);
    if (!product) return res.status(400).json({ error: "Unknown product." });

    const token = await getAccessToken();
    const capture = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const capData = await capture.json();
    if (!capture.ok || capData.status !== "COMPLETED") {
      console.error("PayPal capture error:", capData);
      return res.status(502).json({ error: "Payment could not be completed." });
    }

    // Pull the money actually captured, and the payer, straight from PayPal.
    const pu = capData.purchase_units?.[0];
    const cap = pu?.payments?.captures?.[0];
    const amount = cap?.amount?.value || null;
    const payer = capData.payer || {};
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    // Only keep the fields this product actually defines (ignore anything extra).
    const safeDetails = {};
    for (const f of product.fields) {
      if (f.type === "note") continue;
      if (details && typeof details[f.key] === "string") {
        safeDetails[f.key] = details[f.key].slice(0, 300);
      }
    }

    const record = {
      orderId: orderID,
      captureId: cap?.id || null,
      status: capData.status,
      event: product.event,
      productId: product.id,
      productName: product.name,
      quantity: qty,
      amount,
      currency: cap?.amount?.currency_code || "USD",
      payerName: [payer.name?.given_name, payer.name?.surname].filter(Boolean).join(" "),
      payerEmail: payer.email_address || safeDetails.email || "",
      details: safeDetails,
      paidAt: cap?.create_time || null,
    };

    // Fire the order to the webhook (Sheet + email). Never fail the shopper's
    // receipt if logging hiccups — payment already succeeded.
    await recordOrder(record);

    return res.status(200).json({
      ok: true,
      orderId: orderID,
      amount,
      productName: product.name,
    });
  } catch (err) {
    console.error("capture-order failed:", err);
    return res.status(500).json({ error: "Server error capturing order." });
  }
}

async function recordOrder(record) {
  const url = process.env.ORDERS_WEBHOOK_URL;
  if (!url) {
    console.warn("ORDERS_WEBHOOK_URL not set — order not logged:", record.orderId);
    return;
  }
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.ORDERS_WEBHOOK_SECRET || "",
        type: "order",
        order: record,
      }),
    });
  } catch (err) {
    console.error("Order webhook failed (payment still succeeded):", err);
  }
}
