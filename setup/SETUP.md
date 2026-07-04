# Saint Elias — Custom Registration Store & Admin Portal

This is the new, fully-owned registration system: **Vercel** hosts the site + a
small backend, **PayPal** takes payment, every paid registration is **emailed to
the church and logged to a Google Sheet**, and your team views everyone in a
password-protected **admin portal** at `/admin`.

Nothing charges real money until you switch PayPal from **sandbox (test)** to
**live**. Do the steps below in order — most take a couple of minutes.

---

## 1. Put the site on Vercel

1. Go to **vercel.com → Add New → Project**.
2. Import the GitHub repo **`bannoura9/saint-elias-orthodox-church`**.
3. Framework preset: **Other** (it's a static site + `/api` functions). No build
   command needed. Click **Deploy**.
4. You'll get a preview URL like `saint-elias-...vercel.app`. That's our test site.

## 2. PayPal — get API credentials (keeps payments secure)

1. Go to **developer.paypal.com → Dashboard → Apps & Credentials**.
2. Stay on **Sandbox** for now. Click **Create App** → name it `Saint Elias`.
3. Copy the **Client ID** and **Secret**.
4. (Later, for real payments, flip to **Live** and create a Live app the same way.)

## 3. Google Sheet + Apps Script (orders + email + portal data)

1. Create a new **Google Sheet** in your account (name it e.g. "St Elias
   Registrations").
2. **Extensions → Apps Script**. Delete the sample code, paste the contents of
   **`setup/orders-apps-script.gs`** from this repo.
3. At the top of that script, set:
   - `SECRET` → a long random string (make one up).
   - `NOTIFY_EMAIL` → the address that should receive each registration email.
4. **Deploy → New deployment → type: Web app.**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, authorize when prompted, and **copy the Web app URL** (ends in `/exec`).

## 4. Add the settings to Vercel

In Vercel: **Project → Settings → Environment Variables**. Add these:

| Name | Value |
|------|-------|
| `PAYPAL_CLIENT_ID` | (from step 2) |
| `PAYPAL_CLIENT_SECRET` | (from step 2) |
| `PAYPAL_ENV` | `sandbox` (change to `live` when ready) |
| `ORDERS_WEBHOOK_URL` | the `/exec` URL from step 3 |
| `ORDERS_WEBHOOK_SECRET` | the same `SECRET` string from step 3 |
| `ADMIN_PASSWORD` | a password for your team to open `/admin` |

Then **redeploy** (Deployments → ⋯ → Redeploy) so the settings take effect.

## 5. Test it (no real money)

1. Open `your-site.vercel.app/register`.
2. Pick a tier, fill the form, pay with a **PayPal sandbox test account**
   (developer.paypal.com → Testing Tools → Sandbox Accounts gives you a test
   buyer login).
3. Check: the church email arrives, a row appears in the Google Sheet, and the
   order shows in **`your-site.vercel.app/admin`** (log in with `ADMIN_PASSWORD`).

## 6. Go live

1. In PayPal, create a **Live** app → put its Client ID/Secret in Vercel and set
   `PAYPAL_ENV=live`. Redeploy.
2. Point **steliasarvada.com** at Vercel (Vercel → Domains → add the domain; it
   gives you the exact DNS records to set at GoDaddy). Reversible anytime.

---

### Where prices live
All tiers and prices are in **`data/catalog.js`**. Edit a number, commit/push,
Vercel redeploys automatically. The server always prices orders from this file,
so amounts can never be tampered with in the browser.

### Adding Stripe later
The checkout is structured so a Stripe button can sit next to PayPal with no
change to the catalog or the admin portal.
