import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Eye, EyeOff, RefreshCw, Github, Chrome } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

function generateCaptcha() {
  const ops = ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;

  switch (op) {
    case "+":
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      answer = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * a);
      answer = a - b;
      break;
    case "×":
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 12) + 1;
      answer = a * b;
      break;
    default:
      a = 1; b = 1; answer = 2;
  }

  return { question: `${a} ${op} ${b}`, answer };
}

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parseInt(captchaInput) !== captcha.answer) {
      toast.error("Incorrect captcha. Please try again.");
      refreshCaptcha();
      return;
    }

    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split("@")[0],
            }
          }
        });
        if (error) throw error;
        toast.success("Registration request sent. Please check your email for confirmation.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Access granted. Welcome to CyberShield.");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background cyber-grid px-4 pt-20">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-neon-green/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-strong rounded-2xl p-8 neon-border relative overflow-hidden">
          {/* Scan line effect */}
          <div className="absolute inset-x-0 h-24 scan-line pointer-events-none opacity-20" />
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex rounded-full bg-primary/10 p-3 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {isSignUp ? "Initialize Defense Profile" : "Secure Access Gate"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignUp
                ? "Enroll in the shield network to protect your zone"
                : "Authenticate to access the defense hub"
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="operator@cybershield.io"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Math Captcha */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Security Verification
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-lg border border-border bg-secondary/50 px-4 py-2.5 font-mono text-sm text-foreground text-center select-none">
                  {captcha.question} = ?
                </div>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="rounded-lg border border-border p-2.5 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <input
                type="number"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="Enter answer"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:glow-primary disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Lock className="h-4 w-4 animate-pulse" />
                  Processing...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {isSignUp ? "Initialize Protocol" : "Access Command Center"}
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono"
            >
              {isSignUp
                ? "ALREADY ENROLLED? PROCEED TO LOGIN"
                : "NEW OPERATOR? INITIALIZE ACCESS"}
            </button>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-mono">
                  Identity Verification Providers
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleOAuthLogin("github")}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary/30 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-secondary/50 hover:border-primary/50 disabled:opacity-50"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary/30 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-secondary/50 hover:border-primary/50 disabled:opacity-50"
              >
                <Chrome className="h-4 w-4" />
                <span>Google</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 font-mono">
            ENCRYPTED • ZERO-TRUST • PRIVACY-FIRST
          </p>
        </div>
      </motion.div>
    </div>
  );
}
