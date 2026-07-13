import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Account() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders/me").then((r) => setOrders(r.data)).catch(() => {});
  }, []);

  if (!user) {
    return <div className="pt-40 text-center text-rykzar-silver/60">Please sign in to view your account.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 pt-32 pb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="label-eyebrow mb-1">Account</p>
          <h1 className="font-display text-4xl tracking-tight">{user.name}</h1>
          <p className="text-rykzar-silver/60 text-sm mt-1">{user.email}</p>
        </div>
        <button onClick={logout} className="btn-ghost" data-testid="logout-button">Sign Out</button>
      </div>

      <p className="label-eyebrow mb-4">Order History</p>
      {orders.length === 0 ? (
        <p className="text-rykzar-silver/60 text-sm">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border border-rykzar-gray p-5 flex items-center justify-between">
              <div>
                <p className="font-display text-lg">${o.amount?.toFixed(2)}</p>
                <p className="text-xs text-rykzar-silver/50 mt-1">{new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <span className="text-xs uppercase tracking-widest px-3 py-1 bg-rykzar-red/20 text-rykzar-red">
                {o.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
