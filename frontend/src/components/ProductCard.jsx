import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block transition-transform duration-300 hover:-translate-y-1"
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative overflow-hidden bg-rykzar-gray aspect-[3/4] transition-shadow duration-300 group-hover:shadow-[0_0_30px_rgba(193,18,31,0.25)]">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {product.images?.[1] && (
          <img
            src={product.images[1]}
            alt=""
            className="absolute inset-0 w-full h-full object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}
        {product.new_arrival && (
          <span className="absolute top-3 left-3 bg-rykzar-red text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
            New
          </span>
        )}
      </div>
      <div className="pt-3">
        <p className="font-display text-lg tracking-wide leading-none">{product.name}</p>
        <p className="text-rykzar-silver/70 text-sm mt-1">${product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
