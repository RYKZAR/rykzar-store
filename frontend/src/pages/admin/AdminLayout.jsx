import { NavLink, Outlet, Navigate } from "react-router-dom";
import { LayoutDashboard, Package, ClipboardList } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
];

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) return <div className="pt-40 text-center text-rykzar-silver/60">Loading...</div>;
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;

  return (
    <div className="pt-20 min-h-screen bg-rykzar-black grid lg:grid-cols-[220px_1fr]">
      <aside className="border-r border-rykzar-gray px-4 py-8 hidden lg:block">
        <p className="label-eyebrow px-3 mb-6">Admin Panel</p>
        <nav className="space-y-1">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition-colors ${
                  isActive ? "bg-rykzar-red/15 text-rykzar-red" : "text-rykzar-silver/70 hover:text-white"
                }`
              }
              data-testid={`admin-nav-${label.toLowerCase()}`}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="px-6 sm:px-10 py-10">
        <Outlet />
      </main>
    </div>
  );
}
