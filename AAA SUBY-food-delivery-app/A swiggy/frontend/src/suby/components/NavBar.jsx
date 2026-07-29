import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./NavBar.css";

const NavBar = ({ query, onQueryChange }) => {
  const { user, isLoggedIn, logout } = useAuth();
  const { totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">SUBY</Link>

      {onQueryChange && (
        <input
          className="nav-search"
          type="text"
          placeholder="Search restaurants or cuisines..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      )}

      <div className="nav-right">
        <Link to="/checkout" className="cart-pill">
          🛒 {totalItems > 0 ? `${totalItems} · ₹${totalPrice}` : "Cart"}
        </Link>

        {isLoggedIn ? (
          <div className="nav-user">
            <span>Hi, {user.name.split(" ")[0]}</span>
            <button
              className="link-btn"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="nav-auth-link">Login / SignUp</Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
