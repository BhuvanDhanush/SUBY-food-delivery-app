import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

// Cart shape: { firmId, firmName, items: { [itemId]: { id, name, price, qty } } }
const EMPTY_CART = { firmId: null, firmName: null, items: {} };

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const raw = localStorage.getItem("suby_cart");
    return raw ? JSON.parse(raw) : EMPTY_CART;
  });

  useEffect(() => {
    localStorage.setItem("suby_cart", JSON.stringify(cart));
  }, [cart]);

  const addItem = (firmId, firmName, item) => {
    setCart((prev) => {
      // Starting an order from a different restaurant clears the old cart,
      // same as most food delivery apps do.
      const base = prev.firmId && prev.firmId !== firmId ? EMPTY_CART : prev;
      const existingQty = base.items[item.id]?.qty || 0;
      return {
        firmId,
        firmName,
        items: {
          ...base.items,
          [item.id]: { ...item, qty: existingQty + 1 },
        },
      };
    });
  };

  const removeItem = (itemId) => {
    setCart((prev) => {
      const next = { ...prev.items };
      if (!next[itemId]) return prev;
      if (next[itemId].qty <= 1) {
        delete next[itemId];
      } else {
        next[itemId] = { ...next[itemId], qty: next[itemId].qty - 1 };
      }
      const stillHasItems = Object.keys(next).length > 0;
      return {
        firmId: stillHasItems ? prev.firmId : null,
        firmName: stillHasItems ? prev.firmName : null,
        items: next,
      };
    });
  };

  const clearCart = () => setCart(EMPTY_CART);

  const itemList = Object.values(cart.items);
  const totalItems = itemList.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = itemList.reduce((sum, i) => sum + i.qty * i.price, 0);

  return (
    <CartContext.Provider
      value={{ cart, itemList, totalItems, totalPrice, addItem, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
