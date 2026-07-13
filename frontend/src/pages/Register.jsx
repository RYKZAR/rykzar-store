import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Account created");
      navigate("/account");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 pt-40 pb-20">
      <h1 className="font-display text-4xl tracking-tight mb-8 text-center">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          required
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-rykzar-gray border border-rykzar-gray px-4 py-3 text-white placeholder:text-rykzar-silver/40 focus:outline-none focus:border-rykzar-red"
          data-testid="register-name-input"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-rykzar-gray border border-rykzar-gray px-4 py-3 text-white placeholder:text-rykzar-silver/40 focus:outline-none focus:border-rykzar-red"
          data-testid="register-email-input"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-rykzar-gray border border-rykzar-gray px-4 py-3 text-white placeholder:text-rykzar-silver/40 focus:outline-none focus:border-rykzar-red"
          data-testid="register-password-input"
        />
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50" data-testid="register-submit-button">
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
      <p className="text-center text-sm text-rykzar-silver/60 mt-6">
        Already have an account? <Link to="/login" className="text-rykzar-red">Sign in</Link>
      </p>
    </div>
  );
}
