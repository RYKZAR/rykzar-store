import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const EMPTY_FORM = {
  name: "", description: "", price: "", category: "hoodies",
  images: "", sizes: "S,M,L,XL", colors: "#0B0B0B", stock: 50,
  featured: false, best_seller: false, new_arrival: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = () => api.get("/products").then((r) => setProducts(r.data));

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      ...p,
      price: String(p.price),
      images: (p.images || []).join(", "),
      sizes: (p.sizes || []).join(","),
      colors: (p.colors || []).join(","),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      stock: parseInt(form.stock, 10) || 0,
      featured: form.featured,
      best_seller: form.best_seller,
      new_arrival: form.new_arrival,
    };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product created");
      }
      setModalOpen(false);
      load();
    } catch {
      toast.error("Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    toast.success("Product deleted");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl tracking-tight">Products</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2" data-testid="add-product-button">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="border border-rykzar-gray overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rykzar-gray text-left text-rykzar-silver/60 uppercase tracking-widest text-xs">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-rykzar-gray/60" data-testid={`product-row-${p.id}`}>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3 capitalize text-rykzar-silver/70">{p.category}</td>
                <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3 flex gap-3 justify-end">
                  <button onClick={() => openEdit(p)} aria-label="Edit" data-testid={`edit-product-${p.id}`}>
                    <Pencil size={15} className="text-rykzar-silver/70 hover:text-white" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} aria-label="Delete" data-testid={`delete-product-${p.id}`}>
                    <Trash2 size={15} className="text-rykzar-silver/70 hover:text-rykzar-red" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
          <div className="bg-rykzar-black border border-rykzar-gray w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="font-display text-2xl">{editingId ? "Edit Product" : "New Product"}</p>
              <button onClick={() => setModalOpen(false)} aria-label="Close"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-rykzar-gray px-3 py-2.5 text-sm focus:outline-none" data-testid="form-name" />
              <textarea required placeholder="Description" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-rykzar-gray px-3 py-2.5 text-sm focus:outline-none" rows={3} data-testid="form-description" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.01" placeholder="Price" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="bg-rykzar-gray px-3 py-2.5 text-sm focus:outline-none" data-testid="form-price" />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="bg-rykzar-gray px-3 py-2.5 text-sm focus:outline-none" data-testid="form-category">
                  {["hoodies", "tees", "outerwear", "pants", "accessories"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <input placeholder="Image URLs (comma separated)" value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                className="w-full bg-rykzar-gray px-3 py-2.5 text-sm focus:outline-none" data-testid="form-images" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Sizes (S,M,L)" value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                  className="bg-rykzar-gray px-3 py-2.5 text-sm focus:outline-none" data-testid="form-sizes" />
                <input placeholder="Stock" type="number" value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="bg-rykzar-gray px-3 py-2.5 text-sm focus:outline-none" data-testid="form-stock" />
              </div>
              <div className="flex gap-5 pt-2 text-sm">
                {["featured", "best_seller", "new_arrival"].map((key) => (
                  <label key={key} className="flex items-center gap-2 text-rykzar-silver/80">
                    <input type="checkbox" checked={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
                    {key.replace("_", " ")}
                  </label>
                ))}
              </div>
              <button type="submit" className="btn-primary w-full mt-4" data-testid="form-submit">
                {editingId ? "Save Changes" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
