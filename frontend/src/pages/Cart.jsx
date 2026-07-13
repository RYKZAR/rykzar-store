import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import api from "@/lib/api";
import { toast } from "sonner";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await api.post("/checkout/session", {
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
        })),
        origin_url: window.location.origin,
      });
      window.location.href = res.data.url;
    } catch (e) {
      toast.error("Checkout failed. Please try again.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-40 pb-20 text-center">
        <h1 className="font-display text-4xl tracking-tight mb-4">Your Bag is Empty</h1>
        <p className="text-rykzar-silver/60">Add something from the collection to get started.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 pt-32 pb-20">
      <h1 className="font-display text-5xl tracking-tight mb-10">Your Bag</h1>

      <div className="space-y-6 mb-10">
        {items.map((item) => (
          <div
            key={`${item.product_id}-${item.size}-${item.color}`}
            className="flex gap-5 border-b border-rykzar-gray pb-6"
          >
            <img src={item.image} alt={item.name} className="w-24 h-32 object-cover bg-rykzar-gray" />
            <div className="flex-1">
              <p className="font-display text-xl tracking-wide">{item.name}</p>
              <p className="text-sm text-rykzar-silver/60 mt-1">Size {item.size}</p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center border border-rykzar-silver/30">
                  <button
                    className="px-3 py-2"
                    onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 text-sm">{item.quantity}</span>
                  <button
                    className="px-3 py-2"
                    onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="font-display text-lg">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
            <button
              onClick={() => removeItem(item.product_id, item.size, item.color)}
              className="text-rykzar-silver/50 hover:text-rykzar-red h-fit"
              aria-label="Remove item"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-8">
        <p className="label-eyebrow">Subtotal</p>
        <p className="font-display text-2xl">${subtotal.toFixed(2)}</p>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50"
        data-testid="checkout-button"
      >
        {loading ? "Redirecting to Stripe..." : "Proceed to Checkout"}
      </button>
    </div>
  );
}
