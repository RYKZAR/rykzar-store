import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Hoodies", value: "hoodies" },
  { label: "Shirt", value: "tees" },
  { label: "Outerwear", value: "outerwear" },
  { label: "Pants", value: "pants" },
  { label: "Accessories", value: "accessories" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const query = category ? `?category=${category}` : "";
    api
      .get(`/products${query}`)
      .then((r) => setProducts(r.data))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="max-w-[1600px] mx-auto px-6 sm:px-8 pt-32 pb-20">
      <p className="label-eyebrow mb-2">Full Catalog</p>
      <h1 className="font-display text-5xl sm:text-6xl tracking-tight mb-10">Shop All</h1>

      <div className="flex flex-wrap gap-3 mb-12">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setSearchParams(c.value ? { category: c.value } : {})}
            className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
              category === c.value
                ? "bg-rykzar-red border-rykzar-red text-white"
                : "border-rykzar-silver/30 text-rykzar-silver/70 hover:border-white hover:text-white"
            }`}
            data-testid={`category-filter-${c.value || "all"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-rykzar-silver/60">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-rykzar-silver/60">No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
