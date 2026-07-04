// GET /api/registrations
// Admin-only. Reads all recorded registrations from the orders webhook
// (Google Apps Script doGet → Sheet rows as JSON) and returns them.
// Auth: caller must send header `x-admin-key` matching ADMIN_PASSWORD.

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const expected = process.env.ADMIN_PASSWORD;
  const provided = req.headers["x-admin-key"];
  if (!expected) {
    return res.status(503).json({ error: "Admin portal is not configured yet." });
  }
  if (!provided || provided !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const url = process.env.ORDERS_WEBHOOK_URL;
  const secret = process.env.ORDERS_WEBHOOK_SECRET || "";
  if (!url) {
    return res.status(503).json({ error: "Orders store is not configured yet.", orders: [] });
  }

  try {
    const sep = url.includes("?") ? "&" : "?";
    const resp = await fetch(`${url}${sep}secret=${encodeURIComponent(secret)}&type=list`, {
      method: "GET",
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error("Orders webhook list failed:", resp.status, text);
      return res.status(502).json({ error: "Could not load orders." });
    }
    const data = await resp.json();
    const orders = Array.isArray(data) ? data : data.orders || [];
    return res.status(200).json({ orders });
  } catch (err) {
    console.error("registrations failed:", err);
    return res.status(500).json({ error: "Server error loading orders." });
  }
}
