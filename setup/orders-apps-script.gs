/**
 * Saint Elias — Orders webhook (Google Apps Script)
 * ------------------------------------------------------------------
 * Paste this into a Google Apps Script project bound to your orders
 * Google Sheet (Extensions ▸ Apps Script). It does three things:
 *   • doPost  → appends each paid registration as a row AND emails the church
 *   • doGet   → returns all rows as JSON (the admin portal reads this)
 *
 * SETUP:
 *   1. Set SECRET below to a long random string. Use the SAME value in
 *      Vercel as ORDERS_WEBHOOK_SECRET.
 *   2. Set NOTIFY_EMAIL to the address that should receive each registration.
 *   3. Deploy ▸ New deployment ▸ type "Web app" ▸ Execute as: Me ▸
 *      Who has access: "Anyone". Copy the /exec URL → that is
 *      ORDERS_WEBHOOK_URL in Vercel.
 *   4. First run will ask you to authorize the script — allow it.
 */

var SECRET = "CHANGE-ME-to-a-long-random-string";
var NOTIFY_EMAIL = "office@steliasarvada.com"; // where registration emails go
var SHEET_NAME = "Registrations";

var HEADERS = [
  "Paid At", "Event", "Type", "Product Id", "Registrant", "Payer Email",
  "Company", "Player 1", "Player 2", "Player 3", "Player 4",
  "Contact Name", "Phone", "Quantity", "Amount", "Currency",
  "Status", "Order Id", "Capture Id"
];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || "{}");
    if (body.secret !== SECRET) return json_({ error: "unauthorized" }, 401);
    var o = body.order || {};
    var d = o.details || {};

    sheet_().appendRow([
      o.paidAt || new Date().toISOString(),
      o.event || "", o.productName || "", o.productId || "",
      registrant_(o), o.payerEmail || "",
      d.company || "", d.player1 || "", d.player2 || "", d.player3 || "", d.player4 || "",
      d.contactName || "", d.phone || "",
      o.quantity || 1, o.amount || "", o.currency || "USD",
      o.status || "", o.orderId || "", o.captureId || ""
    ]);

    emailNotify_(o, d);
    return json_({ ok: true });
  } catch (err) {
    return json_({ error: String(err) }, 500);
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.secret !== SECRET) return json_({ error: "unauthorized" }, 401);

  var sh = sheet_();
  var last = sh.getLastRow();
  if (last < 2) return json_({ orders: [] });
  var values = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();

  var orders = values.map(function (r) {
    return {
      paidAt: r[0], event: r[1], productName: r[2], productId: r[3],
      payerName: r[4], payerEmail: r[5],
      details: {
        company: r[6], player1: r[7], player2: r[8], player3: r[9], player4: r[10],
        contactName: r[11], phone: r[12]
      },
      quantity: r[13], amount: r[14], currency: r[15],
      status: r[16], orderId: r[17], captureId: r[18]
    };
  });
  return json_({ orders: orders });
}

function registrant_(o) {
  var d = o.details || {};
  return d.company || d.contactName || d.name || d.player1 || o.payerName || o.payerEmail || "";
}

function emailNotify_(o, d) {
  if (!NOTIFY_EMAIL) return;
  var lines = [
    "New registration — " + (o.productName || ""),
    "",
    "Event:      " + (o.event || ""),
    "Type:       " + (o.productName || ""),
    "Amount:     $" + (o.amount || "") + " " + (o.currency || "USD"),
    "Quantity:   " + (o.quantity || 1),
    "Registrant: " + registrant_(o),
    "Email:      " + (o.payerEmail || ""),
    d.company ? "Company:    " + d.company : "",
    d.contactName ? "Contact:    " + d.contactName : "",
    d.phone ? "Phone:      " + d.phone : "",
    (d.player1 || d.player2 || d.player3 || d.player4)
      ? "Players:    " + [d.player1, d.player2, d.player3, d.player4].filter(String).join(", ") : "",
    "",
    "Order #:    " + (o.orderId || ""),
    "Paid at:    " + (o.paidAt || "")
  ].filter(function (x) { return x !== ""; });

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: "New registration: " + (o.productName || "Saint Elias"),
    body: lines.join("\n")
  });
}

function json_(obj, code) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
