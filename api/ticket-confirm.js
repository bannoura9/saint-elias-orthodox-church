// GET /api/ticket-confirm?session_id=cs_...
// Stripe redirects the buyer here after payment. We verify the session
// DIRECTLY with Stripe (never trusting the URL alone), record the paid order
// in Supabase, then send the buyer to the thank-you view. Recording is
// idempotent on stripe_session_id, so refreshing this URL can't duplicate
// an order.

const STRIPE_BASE = "https://api.stripe.com";
const SUPABASE_URL = "https://uwewlcjouzkykzyuxzow.supabase.co";

export default async function handler(req, res) {
  const sessionId = String(req.query?.session_id || "");
  const back = (ok, reason) =>
    res.redirect(302, ok ? "/tickets?success=1" : `/tickets?error=${encodeURIComponent(reason)}`);

  if (!/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) return back(false, "bad-session");

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return back(false, "not-configured");

  try {
    // 1) Verify with Stripe that this session is real and PAID.
    const resp = await fetch(`${STRIPE_BASE}/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const session = await resp.json();
    if (!resp.ok) {
      console.error("Stripe session fetch failed:", resp.status, session?.error?.message);
      return back(false, "verify-failed");
    }
    if (session.payment_status !== "paid") return back(false, "not-paid");

    // 2) Record the order in Supabase (service key bypasses RLS; only the
    //    admin portal can read it back). Skip silently if not configured.
    const dbKey = process.env.SUPABASE_SECRET_KEY;
    if (dbKey) {
      const headers = {
        apikey: dbKey,
        Authorization: `Bearer ${dbKey}`,
        "Content-Type": "application/json",
      };

      // Idempotency: bail out if this session was already recorded.
      const existing = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?stripe_session_id=eq.${sessionId}&select=id`,
        { headers }
      ).then((r) => (r.ok ? r.json() : []));

      if (!Array.isArray(existing) || existing.length === 0) {
        const md = session.metadata || {};
        const insert = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
          method: "POST",
          headers: { ...headers, Prefer: "return=minimal" },
          body: JSON.stringify({
            event: md.event || md.ticket_id || "unknown",
            name: md.buyer_name || session.customer_details?.name || "",
            email: session.customer_details?.email || session.customer_email || "",
            quantity: Number(md.quantity) || undefined,
            amount_cents: session.amount_total,
            currency: (session.currency || "usd").toUpperCase(),
            status: "paid",
            stripe_session_id: sessionId,
            metadata: md,
          }),
        });
        if (!insert.ok) {
          // Payment already succeeded — log loudly but still thank the buyer.
          console.error("Supabase order insert failed:", insert.status, await insert.text());
        }
      }
    } else {
      console.error("SUPABASE_SECRET_KEY not set — paid order NOT recorded:", sessionId);
    }

    return back(true);
  } catch (err) {
    console.error("ticket-confirm failed:", err);
    return back(false, "server-error");
  }
}
