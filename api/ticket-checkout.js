// POST /api/ticket-checkout
// Body: { ticketId, quantity, name, email }
// Prices the order AUTHORITATIVELY from data/tickets.js, then creates a
// Stripe Checkout Session and returns its hosted-payment URL. The browser
// never sends an amount, and the Stripe secret key never leaves the server.
// Talks to Stripe's REST API directly with fetch — no SDK dependency.

import { getTicket } from "../data/tickets.js";
import { readJson } from "./_paypal.js";

const STRIPE_BASE = "https://api.stripe.com";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(503).json({ error: "Ticketing is not configured yet." });
  }

  try {
    const { ticketId, quantity, name, email } = await readJson(req);

    const ticket = getTicket(ticketId);
    if (!ticket) return res.status(400).json({ error: "Unknown ticket." });

    const max = ticket.maxQuantity || 10;
    const qty = Math.max(1, Math.min(max, parseInt(quantity, 10) || 1));

    const buyerName = String(name || "").trim().slice(0, 120);
    const buyerEmail = String(email || "").trim().slice(0, 200);
    if (!buyerName) return res.status(400).json({ error: "Please enter your name." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
      return res.status(400).json({ error: "Please enter a valid email." });
    }

    const origin = "https://steliasarvada.com";
    const unitCents = Math.round(Number(ticket.price) * 100);

    // Stripe's API takes form-encoded bodies.
    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", `${origin}/api/ticket-confirm?session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", `${origin}/tickets?canceled=1`);
    params.set("customer_email", buyerEmail);
    params.set("line_items[0][quantity]", String(qty));
    params.set("line_items[0][price_data][currency]", "usd");
    params.set("line_items[0][price_data][unit_amount]", String(unitCents));
    params.set("line_items[0][price_data][product_data][name]", `${ticket.event} — ${ticket.name}`);
    params.set("metadata[ticket_id]", ticket.id);
    params.set("metadata[event]", ticket.event);
    params.set("metadata[buyer_name]", buyerName);
    params.set("metadata[quantity]", String(qty));
    params.set("payment_intent_data[description]", `${ticket.event} — ${ticket.name} × ${qty}`);

    const resp = await fetch(`${STRIPE_BASE}/v1/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await resp.json();
    if (!resp.ok || !session.url) {
      console.error("Stripe session create failed:", resp.status, session?.error?.message);
      return res.status(502).json({ error: "Could not start checkout. Please try again." });
    }

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("ticket-checkout failed:", err);
    return res.status(500).json({ error: "Server error starting checkout." });
  }
}
