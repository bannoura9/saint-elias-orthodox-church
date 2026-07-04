// ---------------------------------------------------------------------------
// Saint Elias — product catalog (single source of truth for prices).
//
// This file is imported BOTH by the server (to price orders authoritatively,
// so a shopper can never tamper with an amount) and by the browser (to render
// the registration forms). Never trust a price sent from the browser — the
// server always re-reads it from here by `id`.
//
// To change a price, edit `price` (a number, in USD). To hide an item, set
// `active: false`. `compareAt` is the optional "was" price shown struck-through.
// ---------------------------------------------------------------------------

export const EVENTS = {
  golf: {
    id: "golf",
    title: "3rd St. Elias Invitational Golf Scramble",
    date: "Monday, September 21, 2026",
    location: "Blackstone Country Club · 7777 S Country Club Pkwy, Aurora, CO 80016",
    schedule: "Registration 8:30 AM · Shotgun start 10:00 AM · Lunch included · No refunds",
    sponsorEmail: "daoud.davidsonsmotors@gmail.com",
  },
};

export const PRODUCTS = [
  {
    id: "golf-tee-time",
    event: "golf",
    name: "Tee Time",
    blurb: "Reserve a tee time and register up to 4 players.",
    price: 225,
    compareAt: 300,
    active: true,
    // Fields collected from the buyer for this product.
    fields: [
      { key: "player1", label: "Player 1 name", type: "text", required: true },
      { key: "player2", label: "Player 2 name (optional)", type: "text", required: false },
      { key: "player3", label: "Player 3 name (optional)", type: "text", required: false },
      { key: "player4", label: "Player 4 name (optional)", type: "text", required: false },
      { key: "phone", label: "Contact phone", type: "tel", required: true },
      { key: "email", label: "Contact email", type: "email", required: true },
    ],
  },
  {
    id: "golf-lunch",
    event: "golf",
    name: "Lunch (per person)",
    blurb: "Join us for the tournament luncheon — one ticket per person.",
    price: 60,
    compareAt: 100,
    active: true,
    fields: [
      { key: "name", label: "Your name", type: "text", required: true },
      { key: "email", label: "Contact email", type: "email", required: true },
    ],
  },
  {
    id: "golf-hole-sponsor",
    event: "golf",
    name: "Hole Sponsor",
    blurb: "Your company name on a hole. Does not include a foursome.",
    price: 250,
    compareAt: 400,
    active: true,
    fields: [
      { key: "company", label: "Company / sponsor name (as it should appear)", type: "text", required: true },
      { key: "contactName", label: "Contact name", type: "text", required: true },
      { key: "phone", label: "Contact phone", type: "tel", required: true },
      { key: "email", label: "Contact email", type: "email", required: true },
      { key: "logoNote", label: "Logo / artwork — email files to daoud.davidsonsmotors@gmail.com", type: "note" },
    ],
  },
  {
    id: "golf-silver-sponsor",
    event: "golf",
    name: "Silver Sponsor",
    blurb: "Includes a foursome, recognition banner, announcement and logo at the luncheon.",
    price: 2000,
    compareAt: 3000,
    active: true,
    fields: [
      { key: "company", label: "Company / sponsor name (as it should appear)", type: "text", required: true },
      { key: "contactName", label: "Contact name", type: "text", required: true },
      { key: "phone", label: "Contact phone", type: "tel", required: true },
      { key: "email", label: "Contact email", type: "email", required: true },
      { key: "player1", label: "Player 1 name (optional)", type: "text", required: false },
      { key: "player2", label: "Player 2 name (optional)", type: "text", required: false },
      { key: "player3", label: "Player 3 name (optional)", type: "text", required: false },
      { key: "player4", label: "Player 4 name (optional)", type: "text", required: false },
      { key: "logoNote", label: "Logo / artwork — email files to daoud.davidsonsmotors@gmail.com", type: "note" },
    ],
  },
  {
    id: "golf-gold-sponsor",
    event: "golf",
    name: "Gold Sponsor",
    blurb: "Premier sponsorship. Includes a foursome, recognition banner, announcement and logo at the luncheon.",
    price: 3000,
    compareAt: 5000,
    active: true,
    fields: [
      { key: "company", label: "Company / sponsor name (as it should appear)", type: "text", required: true },
      { key: "contactName", label: "Contact name", type: "text", required: true },
      { key: "phone", label: "Contact phone", type: "tel", required: true },
      { key: "email", label: "Contact email", type: "email", required: true },
      { key: "player1", label: "Player 1 name (optional)", type: "text", required: false },
      { key: "player2", label: "Player 2 name (optional)", type: "text", required: false },
      { key: "player3", label: "Player 3 name (optional)", type: "text", required: false },
      { key: "player4", label: "Player 4 name (optional)", type: "text", required: false },
      { key: "logoNote", label: "Logo / artwork — email files to daoud.davidsonsmotors@gmail.com", type: "note" },
    ],
  },
];

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id && p.active) || null;
}

// Public, safe-to-expose view of the catalog for the browser.
export function publicCatalog() {
  return {
    events: EVENTS,
    products: PRODUCTS.filter((p) => p.active).map((p) => ({
      id: p.id,
      event: p.event,
      name: p.name,
      blurb: p.blurb,
      price: p.price,
      compareAt: p.compareAt || null,
      fields: p.fields,
    })),
  };
}
