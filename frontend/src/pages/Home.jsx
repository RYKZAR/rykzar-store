import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Zap, Eye } from "lucide-react";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";

const HERO_BG =
  "https://images.unsplash.com/photo-1765273805583-18e9c7e3cf36?crop=entropy&cs=srgb&fm=jpg&q=85&w=1800";
const BRAND_STORY_IMG =
  "https://images.unsplash.com/photo-1763504015875-7ecef998af64?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200";

const MARQUEE_WORDS = ["RYKZAR", "POWER", "FREEDOM", "LOYALTY", "MYSTERY"];

function Marquee() {
  const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  return (
    <div className="relative overflow-hidden border-y border-rykzar-gray bg-rykzar-black py-5">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((rep) => (
          <div key={rep} className="flex items-center shrink-0">
            {words.map((w, i) => (
              <span key={`${rep}-${i}`} className="flex items-center">
                <span className="font-display text-3xl sm:text-4xl tracking-wide text-rykzar-silver/20 px-6">
                  {w}
                </span>
                <span className="w-2 h-2 rounded-full bg-rykzar-red/50" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="section-divider max-w-[1600px] mx-auto" />;
}

function Section({ title, eyebrow, children }) {
  return (
    <section className="max-w-[1600px] mx-auto px-6 sm:px-8 py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="label-eyebrow mb-2">{eyebrow}</p>
          <h2 className="font-display text-4xl sm:text-5xl tracking-tight">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    api.get("/products?featured=true").then((r) => setFeatured(r.data.slice(0, 4)));
    api.get("/products?best_seller=true").then((r) => setBestSellers(r.data.slice(0, 4)));
    api.get("/products?new_arrival=true").then((r) => setNewArrivals(r.data.slice(0, 4)));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden grain">
        <img src={HERO_BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-rykzar-black via-rykzar-black/40 to-black/60" />
        <div className="relative z-10 h-full flex flex-col items-start justify-end max-w-[1600px] mx-auto px-6 sm:px-8 pb-24">
          <p className="label-eyebrow text-rykzar-red mb-4 animate-fade-up">Power &middot; Freedom &middot; Loyalty</p>
          <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-tighter max-w-3xl animate-fade-up">
            RIDE IN THE DARK.<br />OWN THE NIGHT.
          </h1>
          <p className="text-rykzar-silver/80 max-w-md mt-6 text-base sm:text-lg animate-fade-up">
            Luxury streetwear forged for those who move alone and answer to no one.
          </p>
          <div className="flex gap-4 mt-8 animate-fade-up">
            <Link to="/shop" className="btn-primary" data-testid="hero-shop-now">Shop Now</Link>
            <a href="#brand-story" className="btn-ghost">Our Story</a>
          </div>
        </div>
      </section>

      <Marquee />

      {/* Featured */}
      <Section eyebrow="The Drop" title="Featured Collection">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      <Divider />

      {/* Best Sellers - asymmetrical bento */}
      <section className="max-w-[1600px] mx-auto px-6 sm:px-8 py-20">
        <p className="label-eyebrow mb-2">Proven</p>
        <h2 className="font-display text-4xl sm:text-5xl tracking-tight mb-10">Best Sellers</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {bestSellers.map((p, idx) => (
            <div key={p.id} className={idx === 0 ? "lg:col-span-2 lg:row-span-2" : ""}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* Brand Story */}
      <section id="brand-story" className="relative py-32 overflow-hidden grain">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/5] overflow-hidden">
            <img src={BRAND_STORY_IMG} alt="RYKZAR brand story" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="label-eyebrow text-rykzar-red mb-4">The Legend</p>
            <h2 className="font-display text-4xl sm:text-5xl tracking-tight mb-6">
              BORN FROM THE SHADOW OF A BLACK HORSE
            </h2>
            <p className="text-rykzar-silver/80 leading-relaxed max-w-lg">
              RYKZAR takes its mark from a myth: a black horse with eyes like burning embers, said to
              run free where no one else dares. We build for the ones who carry that same fire &mdash;
              unshaken, unowned, always moving forward.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      {/* Why Choose */}
      <section className="max-w-[1600px] mx-auto px-6 sm:px-8 py-20">
        <p className="label-eyebrow mb-2 text-center">The Standard</p>
        <h2 className="font-display text-4xl sm:text-5xl tracking-tight mb-14 text-center">Why Choose RYKZAR</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "Built to Last", desc: "Heavyweight fabrics and reinforced stitching, made for the long ride." },
            { icon: Zap, title: "Bold by Design", desc: "Every piece carries the sigil. No mistaking who you're loyal to." },
            { icon: Eye, title: "Limited Drops", desc: "Small batch releases. Once it's gone, it doesn't come back." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="border border-rykzar-gray p-8 text-center transition-all duration-300 hover:border-rykzar-red/60 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(193,18,31,0.15)]">
              <Icon className="mx-auto text-rykzar-red mb-4" size={28} />
              <p className="font-display text-xl tracking-wide mb-2">{title}</p>
              <p className="text-rykzar-silver/70 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Marquee />

      {/* New Arrivals */}
      <Section eyebrow="Just In" title="New Arrivals">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      {/* Newsletter */}
      <section className="bg-rykzar-gray py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight mb-3">Join the Herd</h2>
          <p className="text-rykzar-silver/70 mb-8">Get first access to drops, restocks, and stories from the pack.</p>
          <form
            className="flex flex-col sm:flex-row gap-3"
            onSubmit={(e) => e.preventDefault()}
            data-testid="newsletter-form"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="flex-1 bg-rykzar-black border border-rykzar-silver/30 px-4 py-3 text-white placeholder:text-rykzar-silver/40 focus:outline-none focus:border-rykzar-red"
              data-testid="newsletter-email-input"
            />
            <button type="submit" className="btn-primary" data-testid="newsletter-submit-button">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}
