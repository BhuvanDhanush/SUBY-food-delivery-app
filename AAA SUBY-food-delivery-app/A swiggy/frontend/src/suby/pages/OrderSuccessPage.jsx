import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import "./OrderSuccessPage.css";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const { token } = useAuth();
  const [order, setOrder] = useState(location.state?.order || null);
  const [status, setStatus] = useState(order ? "ready" : "loading");

  useEffect(() => {
    if (order) return;
    api
      .getOrder(orderId, token)
      .then((data) => {
        setOrder(data.order);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [orderId, order, token]);

  if (status === "loading") {
    return (
      <div>
        <NavBar />
        <p className="status-msg">Loading order…</p>
      </div>
    );
  }

  if (status === "error" || !order) {
    return (
      <div>
        <NavBar />
        <div className="success-page">
          <p>We couldn&apos;t find that order.</p>
          <Link to="/" className="back-link">← Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className="success-page">
        <div className="success-icon">✅</div>
        <h1>
          {order.paymentMethod === "cod" ? "Order confirmed!" : "Payment successful!"}
        </h1>
        <p className="success-sub">
          Your order from <strong>{order.firmName.replace(/-/g, " ")}</strong> is being prepared.
        </p>

        <div className="order-card">
          <div className="order-card-row">
            <span>Order ID</span>
            <span>#{order.id}</span>
          </div>
          <div className="order-card-row">
            <span>Payment method</span>
            <span className="capitalize">{order.paymentMethod}</span>
          </div>
          <div className="order-card-row">
            <span>Delivering to</span>
            <span>{order.address}</span>
          </div>
          <ul className="order-items">
            {order.items.map((item) => (
              <li key={item.id}>
                <span>{item.qty} × {item.name}</span>
                <span>₹{item.qty * item.price}</span>
              </li>
            ))}
          </ul>
          <div className="order-card-total">
            <span>Total paid</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        <Link to="/" className="back-link">← Order something else</Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
