import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const { cart, itemList, totalItems, totalPrice, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  if (totalItems === 0) {
    return (
      <div>
        <NavBar />
        <div className="checkout-empty">
          <p>Your cart is empty.</p>
          <Link to="/" className="back-link">← Browse restaurants</Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setPlacing(true);
    try {
      const { order } = await api.createOrder(
        {
          firmId: cart.firmId,
          firmName: cart.firmName,
          items: itemList.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
          address,
          paymentMethod,
          card:
            paymentMethod === "card"
              ? { number: cardNumber, expiry, cvv }
              : paymentMethod === "upi"
              ? { upiId }
              : undefined,
        },
        token
      );
      clearCart();
      navigate(`/order-success/${order.id}`, { state: { order } });
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="checkout-page">
        <h1>Checkout</h1>

        <div className="checkout-grid">
          <form className="checkout-form" onSubmit={handlePlaceOrder}>
            <section>
              <h2>Delivery address</h2>
              <textarea
                required
                placeholder="Flat / house no., street, area, city, pincode"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />
            </section>

            <section>
              <h2>Payment method</h2>
              <div className="payment-options">
                {["card", "upi", "cod"].map((method) => (
                  <label key={method} className={`payment-option ${paymentMethod === method ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    {method === "card" && "Credit / Debit Card"}
                    {method === "upi" && "UPI"}
                    {method === "cod" && "Cash on Delivery"}
                  </label>
                ))}
              </div>

              {paymentMethod === "card" && (
                <div className="payment-fields">
                  <label>
                    Card number
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="4242 4242 4242 4242"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </label>
                  <div className="payment-fields-row">
                    <label>
                      Expiry (MM/YY)
                      <input
                        type="text"
                        placeholder="12/28"
                        required
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                      />
                    </label>
                    <label>
                      CVV
                      <input
                        type="password"
                        placeholder="123"
                        required
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="payment-fields">
                  <label>
                    UPI ID
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </label>
                </div>
              )}

              {paymentMethod === "cod" && (
                <p className="cod-note">Pay with cash when your order arrives.</p>
              )}
            </section>

            {error && <p className="checkout-error">{error}</p>}

            <button type="submit" className="place-order-btn" disabled={placing}>
              {placing
                ? "Processing…"
                : paymentMethod === "cod"
                ? `Place order · ₹${totalPrice}`
                : `Pay ₹${totalPrice}`}
            </button>
            <p className="payment-disclaimer">
              This is a demo checkout — no real payment is processed.
            </p>
          </form>

          <aside className="order-summary">
            <h2>{cart.firmName?.replace(/-/g, " ")}</h2>
            <ul>
              {itemList.map((item) => (
                <li key={item.id}>
                  <span>{item.qty} × {item.name}</span>
                  <span>₹{item.qty * item.price}</span>
                </li>
              ))}
            </ul>
            <div className="summary-total">
              <span>Total</span>
              <span>₹{totalPrice}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
