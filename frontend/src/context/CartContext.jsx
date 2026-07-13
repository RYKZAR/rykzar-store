import { createContext, useContext, useEffect, useState, useMemo } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "rykzar_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, size, color, quantity = 1) => {
    setItems((prev) => {
      const key = (i) => i.product_id === product.id && i.size === size && i.color === color;
      const existing = prev.find(key);
      if (existing) {
        return prev.map((i) => (key(i) ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          size,
          color,
          quantity,
        },
      ];
    });
    setIsOpen(true);
  };

  const removeItem = (product_id, size, color) => {
    setItems((prev) => prev.filter((i) => !(i.product_id === product_id && i.size === size && i.color === color)));
  };

  const updateQuantity = (product_id, size, color, quantity) => {
    if (quantity < 1) return removeItem(product_id, size, color);
    setItems((prev) =>
      prev.map((i) =>
        i.product_id === product_id && i.size === size && i.color === color ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const { subtotal, count } = useMemo(() => {
    return items.reduce(
      (acc, i) => ({
        subtotal: acc.subtotal + i.price * i.quantity,
        count: acc.count + i.quantity,
      }),
      { subtotal: 0, count: 0 }
    );
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, count, isOpen, setIsOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
