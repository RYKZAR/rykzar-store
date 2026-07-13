import { useEffect, useState } from "react";
import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import api from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data));
  }, []);

  const cards = [
    { label: "Revenue", value: stats ? `$${stats.revenue.toFixed(2)}` : "—", icon: DollarSign },
    { label: "Orders", value: stats?.total_orders ?? "—", icon: ShoppingBag },
    { label: "Products", value: stats?.total_products ?? "—", icon: Package },
    { label: "Customers", value: stats?.total_users ?? "—", icon: Users },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight mb-8">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border border-rykzar-gray p-6" data-testid={`stat-card-${label.toLowerCase()}`}>
            <Icon className="text-rykzar-red mb-3" size={20} />
            <p className="font-display text-2xl">{value}</p>
            <p className="text-xs text-rykzar-silver/60 uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
