import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import { api } from "../api/client";
import "./LandingPage.css";

const Chilies = ({ level }) => {
  if (!level) return <span className="chili-row chili-none">mild</span>;
  return (
    <span className="chili-row" title={`${level}/4 heat`}>
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className={i < level ? "chili on" : "chili"}>🌶</span>
      ))}
    </span>
  );
};

const LandingPage = () => {
  const [query, setQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    api
      .getRestaurants()
      .then((data) => {
        setRestaurants(data.restaurants);
        setCategories(data.categories);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const filtered = restaurants.filter((r) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      r.displayName.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.area.toLowerCase().includes(q);
    const matchesCategory =
      !activeCategory ||
      r.menu.some((m) => m.name.toLowerCase().includes(activeCategory.toLowerCase()));
    return matchesQuery && matchesCategory;
  });

  const chains = restaurants.slice(0, 3);

  return (
    <div>
      <NavBar query={query} onQueryChange={setQuery} />

      <div className="landing">
        <section className="category-strip">
          {categories.map((c) => (
            <button
              key={c.name}
              className={`category-chip ${activeCategory === c.name ? "active" : ""}`}
              onClick={() =>
                setActiveCategory((prev) => (prev === c.name ? null : c.name))
              }
            >
              <span className="category-emoji">{c.emoji}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </section>

        {status === "loading" && <p className="status-msg">Loading restaurants…</p>}
        {status === "error" && (
          <p className="status-msg error">
            Couldn&apos;t reach the backend. Make sure the SUBY backend server is running
            on port 5000 (see the backend README).
          </p>
        )}

        {status === "ready" && (
          <>
            <h2 className="section-title">Top restaurant chains in Hyderabad</h2>
            <section className="chain-grid">
              {chains.map((r) => (
                <Link
                  key={r.firmId}
                  to={`/products/${r.firmId}/${r.firmName}`}
                  className="chain-card"
                  style={{ background: r.gradient }}
                >
                  <span className="chain-emoji">{r.emoji}</span>
                  <span className="chain-name">{r.displayName}</span>
                </Link>
              ))}
            </section>

            <h2 className="section-title">Restaurants with online food delivery in Hyderabad</h2>
            <section className="restaurant-grid">
              {filtered.length === 0 && (
                <p className="empty-state">Nothing matches your search. Try something else.</p>
              )}
              {filtered.map((r) => (
                <Link
                  key={r.firmId}
                  to={`/products/${r.firmId}/${r.firmName}`}
                  className="restaurant-card"
                >
                  <div className="card-art" style={{ background: r.gradient }}>
                    <span className="card-emoji">{r.emoji}</span>
                    {r.discount && <span className="discount-badge">{r.discount}</span>}
                  </div>
                  <div className="card-body">
                    <h3>{r.displayName}</h3>
                    <p className="cuisine">{r.cuisine}</p>
                    <p className="area">{r.area}</p>
                    <div className="card-meta">
                      <Chilies level={r.heat} />
                      <span className="dot">·</span>
                      <span className="time">{r.time}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
