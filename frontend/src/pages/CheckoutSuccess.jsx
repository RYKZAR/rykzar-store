import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useCart } from "@/context/CartContext";

const MAX_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 2000;

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("checking"); // checking | paid | expired | error
  const attempts = useRef(0);
  const { clearCart } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      if (attempts.current >= MAX_ATTEMPTS) {
        setStatus("error");
        return;
      }
      attempts.current += 1;
      try {
        const res = await api.get(`/checkout/status/${sessionId}`);
        if (res.data.payment_status === "paid") {
          setStatus("paid");
          if (!cleared.current) {
            clearCart();
            cleared.current = true;
          }
          return;
        }
        if (res.data.status === "expired") {
          setStatus("expired");
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        setStatus("error");
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
   
  }, [sessionId]);

  return (
    <div className="max-w-lg mx-auto px-6 pt-40 pb-20 text-center">
      {status === "checking" && (
        <>
          <Loader2 className="mx-auto animate-spin text-rykzar-red mb-6" size={40} />
          <h1 className="font-display text-3xl tracking-tight mb-2">Confirming Your Order</h1>
          <p className="text-rykzar-silver/60">Hang tight, we're verifying your payment with Stripe.</p>
        </>
      )}
      {status === "paid" && (
        <>
          <CheckCircle2 className="mx-auto text-rykzar-red mb-6" size={48} />
          <h1 className="font-display text-4xl tracking-tight mb-2">Order Confirmed</h1>
          <p className="text-rykzar-silver/60 mb-8">Your gear is on its way. A confirmation has been sent to your email.</p>
          <Link to="/shop" className="btn-primary" data-testid="continue-shopping-button">Continue Shopping</Link>
        </>
      )}
      {(status === "expired" || status === "error") && (
        <>
          <XCircle className="mx-auto text-rykzar-red mb-6" size={48} />
          <h1 className="font-display text-3xl tracking-tight mb-2">We Couldn't Confirm Payment</h1>
          <p className="text-rykzar-silver/60 mb-8">If you were charged, contact support with your session ID.</p>
          <Link to="/cart" className="btn-ghost">Back to Cart</Link>
        </>
      )}
    </div>
  );
}
