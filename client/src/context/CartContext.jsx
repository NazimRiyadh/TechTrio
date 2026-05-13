import { createContext, useContext, useState, useEffect, useMemo } from "react";

const CartContext = createContext(null);

const loadCart = () => {
  try { return JSON.parse(localStorage.getItem("bigbazar_cart")) || []; }
  catch { return []; }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadCart);

  useEffect(() => { localStorage.setItem("bigbazar_cart", JSON.stringify(items)); }, [items]);

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) {
        return prev.map((i) => i.id === product.id ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) } : i);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, image: product.images?.[0]?.url || "", quantity: qty, stock: product.stock }];
    });
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id, qty) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) } : i));
  };

  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = subtotal * 0.05;
    const shipping = subtotal > 500 ? 0 : 10;
    return { subtotal, tax, shipping, total: subtotal + tax + shipping, count: items.reduce((s, i) => s + i.quantity, 0) };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, ...totals }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
