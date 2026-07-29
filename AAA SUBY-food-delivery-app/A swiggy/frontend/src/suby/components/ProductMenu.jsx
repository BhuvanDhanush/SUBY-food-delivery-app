import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import NavBar from "./NavBar";
import { api } from "../api/client";
import { useCart } from "../context/CartContext";
import "./ProductMenu.css";

const ProductMenu = () => {
  const { firmId, firmName } = useParams();
  const { cart, addItem, removeItem, totalItems, totalPrice } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error

  useEffect(() => {
    setStatus("loading");
    api
      .getRestaurant(firmId)
      .then((data) => {
        setRestaurant(data.restaurant);
        setStatus("ready");
      })
      .catch((err) => {
        setStatus(err.message?.includes("404") || err.message?.includes("not found") ? "notfound" : "error");
      });
  }, [firmId]);

  if (status === "loading") {
    return (
      <div>
        <NavBar />
        <p className="status-msg">Loading menu…</p>
      </div>
    );
  }

  if (status !== "ready") {
    return (
      <div>
        <NavBar />
        <div className="menu-notfound">
          <p>We couldn&apos;t find a kitchen called &ldquo;{decodeURIComponent(firmName)}&rdquo;.</p>
          <Link to="/" className="back-link">← Back to all restaurants</Link>
        </div>
      </div>
    );
  }

  const cartQty = (itemId) =>
    cart.firmId === restaurant.firmId ? cart.items[itemId]?.qty || 0 : 0;

  return (
    <div>
      <NavBar />
      <div className="menu-page">
        <div className="menu-banner" style={{ background: restaurant.gradient }}>
          <Link to="/" className="back-link on-banner">← All restaurants</Link>
          <span className="banner-emoji">{restaurant.emoji}</span>
          <h1>{restaurant.displayName}</h1>
          <p>{restaurant.cuisine} · {restaurant.area} · {restaurant.time}</p>
        </div>

        <ul className="menu-list">
          {restaurant.menu.map((item) => {
            const qty = cartQty(item.id);
            return (
              <li key={item.id} className="menu-item">
                <span className={`veg-dot ${item.veg ? "veg" : "nonveg"}`} />
                <div className="menu-item-info">
                  <h3>{item.name}</h3>
                  <p className="desc">{item.desc}</p>
                  <p className="price">₹{item.price}</p>
                </div>

                <div className="qty-control">
                  {qty ? (
                    <>
                      <button onClick={() => removeItem(item.id)} aria-label={`Remove one ${item.name}`}>−</button>
                      <span className="qty">{qty}</span>
                      <button
                        onClick={() => addItem(restaurant.firmId, restaurant.firmName, item)}
                        aria-label={`Add one ${item.name}`}
                      >
                        +
                      </button>
                    </>
                  ) : (
                    <button
                      className="add-btn"
                      onClick={() => addItem(restaurant.firmId, restaurant.firmName, item)}
                    >
                      Add
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {cart.firmId === restaurant.firmId && totalItems > 0 && (
          <Link to="/checkout" className="cart-bar">
            <span>{totalItems} item{totalItems > 1 ? "s" : ""}</span>
            <span>₹{totalPrice}</span>
            <span className="checkout-btn">Go to checkout</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProductMenu;
