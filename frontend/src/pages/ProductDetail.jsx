import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import api from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    api.get(`/products/${id}`).then((r) => {
      setProduct(r.data);
      setSize(r.data.sizes?.[0] || "");
      setColor(r.data.colors?.[0] || "");
    });
  }, [id]);

  if (!product) {
    return <div className="pt-40 text-center text-rykzar-silver/60">Loading...</div>;
  }

  const handleAddToCart = () => {
    addItem(product, size, color, qty);
    toast.success(`${product.name} added to bag`);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 sm:px-8 pt-28 pb-20 grid lg:grid-cols-2 gap-12">
      {/* Gallery */}
      <div>
        <div className="aspect-[3/4] bg-rykzar-gray overflow-hidden mb-4">
          <img
            src={product.images?.[activeImage]}
            alt={product.name}
            className="w-full h-full object-contain"
            data-testid="product-main-image"
          />
        </div>
        <div className="flex gap-3">
          {product.images?.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`w-20 h-24 overflow-hidden border ${
                activeImage === idx ? "border-rykzar-red" : "border-transparent"
              }`}
              data-testid={`thumbnail-${idx}`}
            >
              <img src={img} alt="" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      </div>

      {/* Details - sticky on desktop */}
      <div className="lg:sticky lg:top-28 self-start">
        <p className="label-eyebrow text-rykzar-red mb-2">{product.category}</p>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight mb-4">{product.name}</h1>
        <p className="text-2xl font-display mb-6">${product.price.toFixed(2)}</p>
        <p className="text-rykzar-silver/80 leading-relaxed mb-8">{product.description}</p>

        {/* Size */}
        <div className="mb-6">
          <p className="label-eyebrow mb-3">Size</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes?.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`w-12 h-12 border text-sm transition-colors rounded-sm ${
                  size === s
                    ? "bg-rykzar-red border-rykzar-red text-white"
                    : "border-rykzar-silver/30 text-rykzar-silver/80 hover:border-white"
                }`}
                data-testid={`size-option-${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="mb-6">
          <p className="label-eyebrow mb-3">Color</p>
          <div className="flex gap-2">
            {product.colors?.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-9 h-9 rounded-sm border-2 ${
                  color === c ? "border-rykzar-red" : "border-white/20"
                }`}
                data-testid={`color-option-${c}`}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-8">
          <p className="label-eyebrow mb-3">Quantity</p>
          <div className="flex items-center border border-rykzar-silver/30 w-fit">
            <button className="px-4 py-3" onClick={() => setQty((q) => Math.max(1, q - 1))} data-testid="decrease-qty">
              <Minus size={14} />
            </button>
            <span className="px-5 text-sm">{qty}</span>
            <button className="px-4 py-3" onClick={() => setQty((q) => q + 1)} data-testid="increase-qty">
              <Plus size={14} />
            </button>
          </div>
        </div>

        <button className="btn-primary w-full" onClick={handleAddToCart} data-testid="add-to-cart-button">
          Add to Bag
        </button>

        <p className="text-xs text-rykzar-silver/50 mt-4">{product.stock} in stock &middot; Ships in 2-4 business days</p>
      </div>
    </div>
  );
}
