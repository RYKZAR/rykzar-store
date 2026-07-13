import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success("Welcome back");
      navigate(user.role === "admin" ? "/admin" : "/account");
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 pt-40 pb-20">
      <h1 className="font-display text-4xl tracking-tight mb-8 text-center">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-rykzar-gray border border-rykzar-gray px-4 py-3 text-white placeholder:text-rykzar-silver/40 focus:outline-none focus:border-rykzar-red"
          data-testid="login-email-input"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-rykzar-gray border border-rykzar-gray px-4 py-3 text-white placeholder:text-rykzar-silver/40 focus:outline-none focus:border-rykzar-red"
          data-testid="login-password-input"
        />
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50" data-testid="login-submit-button">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="text-center text-sm text-rykzar-silver/60 mt-6">
        No account? <Link to="/register" className="text-rykzar-red">Create one</Link>
      </p>
    </div>
  );
}
