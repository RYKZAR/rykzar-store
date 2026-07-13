import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Shop All", to: "/shop" },
  { label: "Hoodies", to: "/shop?category=hoodies" },
  { label: "Outerwear", to: "/shop?category=outerwear" },
  { label: "Accessories", to: "/shop?category=accessories" },
];

export default function Navbar() {
  const { count, setIsOpen } = useCart();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 glass transition-colors duration-300 ${
        scrolled ? "border-b border-white/10" : "border-b border-transparent"
      }`}
    >
      <nav className="max-w-[1600px] mx-auto flex items-center justify-between px-6 sm:px-8 h-20">
        <button
          className="lg:hidden text-rykzar-white"
          onClick={() => setMobileOpen((v) => !v)}
          data-testid="mobile-menu-toggle"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link to="/" className="font-display text-2xl sm:text-3xl tracking-widest text-rykzar-white" data-testid="logo-link">
          RYKZAR
        </Link>

        <ul className="hidden lg:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                to={link.to}
                className="label-eyebrow hover:text-rykzar-red transition-colors duration-200"
                data-testid={`nav-link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate(user ? (user.role === "admin" ? "/admin" : "/account") : "/login")}
            className="text-rykzar-white hover:text-rykzar-red transition-colors duration-200"
            data-testid="account-button"
            aria-label="Account"
          >
            <User size={20} />
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="relative text-rykzar-white hover:text-rykzar-red transition-colors duration-200"
            data-testid="cart-button"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-rykzar-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden glass border-t border-white/10 px-6 py-6 flex flex-col gap-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="label-eyebrow text-base"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
