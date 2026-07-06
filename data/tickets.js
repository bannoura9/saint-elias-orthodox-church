// ---------------------------------------------------------------------------
// Saint Elias — event TICKETS catalog (single source of truth for prices).
//
// Used BOTH by the server (to price Stripe Checkout sessions authoritatively,
// so a buyer can never tamper with an amount) and by the browser (to render
// the /tickets page). Never trust a price sent from the browser — the server
// always re-reads it from here by `id`.
//
// To launch a real event: add it here with `active: true, test: false`.
// `test: true` items are hidden from the public page unless it is opened
// with `?preview=1`, and they are clearly labeled TEST.
// Prices are in USD dollars (converted to cents server-side).
// ---------------------------------------------------------------------------

export const TICKETS = [
  {
    id: "test-event",
    name: "TEST — Ticketing System Check",
    event: "Test Event (not a real event)",
    date: "For testing only",
    location: "Saint Elias Antiochian Orthodox Church, 7580 Pierce St, Arvada, CO 80003",
    blurb: "Internal test ticket to verify the checkout system. Do not purchase — test cards only.",
    price: 1,
    maxQuantity: 10,
    active: true,
    test: true,
  },
  // Example of a real event (inactive template — copy, edit, set active: true):
  // {
  //   id: "festival-2026",
  //   name: "Festival Advance Admission",
  //   event: "16th Annual Mediterranean Festival",
  //   date: "August 29–30, 2026",
  //   location: "Saint Elias Antiochian Orthodox Church, 7580 Pierce St, Arvada, CO 80003",
  //   blurb: "Advance admission — skip the line at the gate. Valid either day.",
  //   price: 5,
  //   maxQuantity: 20,
  //   active: false,
  //   test: false,
  // },
];

export function getTicket(id) {
  return TICKETS.find((t) => t.id === id && t.active) || null;
}

// Public, safe-to-expose view for the browser.
export function publicTickets() {
  return TICKETS.filter((t) => t.active).map((t) => ({
    id: t.id,
    name: t.name,
    event: t.event,
    date: t.date,
    location: t.location,
    blurb: t.blurb,
    price: t.price,
    maxQuantity: t.maxQuantity || 10,
    test: Boolean(t.test),
  }));
}
