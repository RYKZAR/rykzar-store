import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-rykzar-black border-t border-rykzar-gray">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 py-16 grid grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="col-span-2">
          <p className="font-display text-3xl tracking-widest mb-4">RYKZAR</p>
          <p className="text-rykzar-silver/70 text-sm max-w-xs leading-relaxed">
            Power. Freedom. Loyalty. Mystery. Dark streetwear forged for those who ride their own path.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="#" aria-label="Instagram" className="text-rykzar-silver hover:text-rykzar-red transition-colors"><Instagram size={18} /></a>
            <a href="#" aria-label="Twitter" className="text-rykzar-silver hover:text-rykzar-red transition-colors"><Twitter size={18} /></a>
            <a href="#" aria-label="Youtube" className="text-rykzar-silver hover:text-rykzar-red transition-colors"><Youtube size={18} /></a>
          </div>
        </div>

        <div>
          <p className="label-eyebrow mb-4">Shop</p>
          <ul className="space-y-3 text-sm text-rykzar-silver/80">
            <li><Link to="/shop?category=hoodies" className="hover:text-white">Hoodies</Link></li>
            <li><Link to="/shop?category=tees" className="hover:text-white">Shirt</Link></li>
            <li><Link to="/shop?category=outerwear" className="hover:text-white">Outerwear</Link></li>
            <li><Link to="/shop?category=accessories" className="hover:text-white">Accessories</Link></li>
          </ul>
        </div>

        <div>
          <p className="label-eyebrow mb-4">Help</p>
          <ul className="space-y-3 text-sm text-rykzar-silver/80">
            <li><Link to="/account" className="hover:text-white">Order Tracking</Link></li>
            <li><a href="#" className="hover:text-white">Size Guide</a></li>
            <li><a href="#" className="hover:text-white">Shipping</a></li>
            <li><a href="#" className="hover:text-white">Returns</a></li>
          </ul>
        </div>

        <div>
          <p className="label-eyebrow mb-4">Brand</p>
          <ul className="space-y-3 text-sm text-rykzar-silver/80">
            <li><a href="#brand-story" className="hover:text-white">Our Story</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-rykzar-gray px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-rykzar-silver/50">
        <p>&copy; {new Date().getFullYear()} RYKZAR. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
        </div>
      </div>
    </footer>
  );
}
