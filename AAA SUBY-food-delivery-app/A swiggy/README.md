# SUBY — Food Delivery App (Demo)

A full-stack food delivery demo inspired by the reference screenshots: a "SUBY" branded
home page with restaurant listings, a login/signup flow, restaurant menus, and a checkout
page with (mock) payment.

This is a **teaching / demo project**:
- The backend stores users and orders **in memory** — everything resets when the server restarts.
- Payments are **simulated** — no real payment provider is contacted and no real money moves.
  Any well-formed card number / UPI ID is "approved"; Cash on Delivery just confirms the order.

## Project structure

```
A swiggy/
  backend/     Node + Express API (auth, restaurants, orders)
  frontend/    React + Vite app (Login, Home, Menu, Checkout, Order confirmation)
```

## 1. Run the backend

```bash
cd backend
npm install
npm start
```

This starts the API at **http://localhost:5000**. A `.env` file is already included with
sane defaults for local development — change `JWT_SECRET` if you plan to deploy this anywhere.

You should see:
```
SUBY backend running at http://localhost:5000
```

## 2. Run the frontend

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

The frontend already has a `.env` pointing at `http://localhost:5000/api` — if you run the
backend on a different port, update `VITE_API_URL` in `frontend/.env` to match.

## Using the app

1. **Home page** — browse restaurants, filter by category or search.
2. **Restaurant menu** — click a restaurant, add items to your cart.
3. **Login / Sign up** — you'll be asked to log in the first time you go to checkout.
   Sign up with any name/email/password (6+ characters) — there's no email verification,
   it's a demo account store.
4. **Checkout** — enter a delivery address, pick a payment method (Card / UPI / Cash on
   Delivery), and place the order.
5. **Order confirmation** — shows your order ID and summary.

## Notes / things to know

- Data resets whenever you restart the backend (`Ctrl+C` then `npm start` again) — this
  includes accounts and past orders, since everything lives in memory rather than a real
  database.
- The restaurant "photos" are stylised gradient + emoji cards rather than real photographs,
  to keep the project free of any copyright concerns.
- If you want persistent data, the natural next step is swapping the in-memory arrays in
  `backend/server.js` for a real database (e.g. SQLite, MongoDB, or Postgres).
