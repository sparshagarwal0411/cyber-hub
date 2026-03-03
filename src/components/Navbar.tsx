import { Shield, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success("Successfully logged out of the defense network.");
  };

  const navItems = [
    { label: "Home", path: "/" },
    ...(user ? [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Admin", path: "/admin" },
    ] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <Shield className="h-7 w-7 text-primary transition-all group-hover:drop-shadow-[0_0_8px_hsl(var(--neon-cyan))]" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Cyber<span className="text-primary">Shield</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === item.path ? "text-primary" : "text-muted-foreground"
                }`}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-lg border border-primary/30 bg-primary/5 px-5 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/10 font-mono"
            >
              LOGOUT
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:glow-primary"
            >
              Login
            </Link>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button onClick={() => setOpen(!open)} className="text-foreground">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-border"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`text-sm font-medium ${location.pathname === item.path ? "text-primary" : "text-muted-foreground"
                    }`}
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="rounded-lg border border-primary/30 bg-primary/5 px-5 py-2.5 text-center text-sm font-semibold text-primary"
                >
                  LOGOUT
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
