require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { restaurants, categories } = require("./data/restaurants");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

app.use(cors());
app.use(express.json());

// ---- In-memory "database" (resets whenever the server restarts) ----
const users = []; // { id, name, email, passwordHash }
const orders = []; // { id, userId, firmId, firmName, items, total, address, paymentMethod, status, createdAt }
let nextUserId = 1;
let nextOrderId = 1001;

// ---- Helpers ----
function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Not logged in" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Session expired, please log in again" });
  }
}

// ---- Health check ----
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ---- Auth ----
app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are all required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }
  const user = {
    id: nextUserId++,
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
  };
  users.push(user);
  const token = signToken(user);
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase());
  if (!user || !bcrypt.compareSync(password || "", user.passwordHash)) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }
  const token = signToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get("/api/auth/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});

// ---- Restaurants ----
app.get("/api/restaurants", (req, res) => {
  res.json({ restaurants, categories });
});

app.get("/api/restaurants/:firmId", (req, res) => {
  const restaurant = restaurants.find((r) => r.firmId === req.params.firmId);
  if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
  res.json({ restaurant });
});

// ---- Orders / Checkout ----
// This simulates a payment gateway: any well-formed card is "approved".
// No real money moves and no real payment provider is contacted.
app.post("/api/orders", authRequired, (req, res) => {
  const { firmId, firmName, items, address, paymentMethod, card } = req.body || {};

  if (!firmId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Your cart is empty" });
  }
  if (!address || address.trim().length < 6) {
    return res.status(400).json({ error: "Please enter a valid delivery address" });
  }
  if (!["card", "upi", "cod"].includes(paymentMethod)) {
    return res.status(400).json({ error: "Please choose a payment method" });
  }
  if (paymentMethod === "card") {
    const digits = (card?.number || "").replace(/\s/g, "");
    if (digits.length < 12 || !/^\d+$/.test(digits)) {
      return res.status(402).json({ error: "Payment failed: invalid card number" });
    }
    if (!/^\d{2}\/\d{2}$/.test(card?.expiry || "")) {
      return res.status(402).json({ error: "Payment failed: invalid expiry date" });
    }
    if (!/^\d{3,4}$/.test(card?.cvv || "")) {
      return res.status(402).json({ error: "Payment failed: invalid CVV" });
    }
  }
  if (paymentMethod === "upi") {
    if (!card?.upiId || !/^[\w.\-]+@[\w]+$/.test(card.upiId)) {
      return res.status(402).json({ error: "Payment failed: invalid UPI ID" });
    }
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const order = {
    id: nextOrderId++,
    userId: req.user.id,
    firmId,
    firmName,
    items,
    total,
    address,
    paymentMethod,
    status: paymentMethod === "cod" ? "confirmed" : "paid",
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  res.status(201).json({ order });
});

app.get("/api/orders", authRequired, (req, res) => {
  const mine = orders.filter((o) => o.userId === req.user.id);
  res.json({ orders: mine });
});

app.get("/api/orders/:id", authRequired, (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id) && o.userId === req.user.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json({ order });
});

app.listen(PORT, () => {
  console.log(`SUBY backend running at http://localhost:${PORT}`);
});
