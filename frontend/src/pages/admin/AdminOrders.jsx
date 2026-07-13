import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/admin/orders").then((r) => setOrders(r.data));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight mb-8">Orders</h1>
      <div className="border border-rykzar-gray overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rykzar-gray text-left text-rykzar-silver/60 uppercase tracking-widest text-xs">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-rykzar-silver/50">No orders yet.</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-rykzar-gray/60" data-testid={`order-row-${o.id}`}>
                <td className="px-4 py-3">{o.user_email || "Guest"}</td>
                <td className="px-4 py-3 text-rykzar-silver/70">{o.items?.length || 0} item(s)</td>
                <td className="px-4 py-3">${o.amount?.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs uppercase tracking-widest px-2 py-1 bg-rykzar-red/20 text-rykzar-red">
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-rykzar-silver/60">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
