import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => setIsOpen(false)}
        data-testid="cart-overlay"
      />
      <div className="relative w-full max-w-md h-full glass border-l border-white/10 flex flex-col">
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
          <p className="font-display text-2xl tracking-widest">Your Bag</p>
          <button onClick={() => setIsOpen(false)} data-testid="cart-close-button" aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {items.length === 0 && (
            <p className="text-rykzar-silver/60 text-sm mt-8 text-center">Your bag is empty.</p>
          )}
          {items.map((item) => (
            <div key={`${item.product_id}-${item.size}-${item.color}`} className="flex gap-4">
              <img src={item.image} alt={item.name} className="w-20 h-24 object-cover bg-rykzar-gray" />
              <div className="flex-1">
                <p className="font-display text-base tracking-wide">{item.name}</p>
                <p className="text-xs text-rykzar-silver/60 mt-1">Size {item.size}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-rykzar-silver/30">
                    <button
                      className="px-2 py-1"
                      onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)}
                      data-testid={`decrease-qty-${item.product_id}`}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button
                      className="px-2 py-1"
                      onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                      data-testid={`increase-qty-${item.product_id}`}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.product_id, item.size, item.color)}
                className="text-rykzar-silver/50 hover:text-rykzar-red"
                data-testid={`remove-item-${item.product_id}`}
                aria-label="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-6 border-t border-white/10">
            <div className="flex justify-between mb-4 text-sm">
              <span className="text-rykzar-silver/70">Subtotal</span>
              <span className="font-display text-lg">${subtotal.toFixed(2)}</span>
            </div>
            <button
              className="btn-primary w-full"
              onClick={() => {
                setIsOpen(false);
                navigate("/cart");
              }}
              data-testid="view-cart-checkout-button"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
