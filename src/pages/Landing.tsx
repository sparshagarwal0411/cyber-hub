import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Radar, Eye, Key, Bot, ArrowRight, ChevronDown } from "lucide-react";

const CyberGlobe = lazy(() => import("../components/CyberGlobe"));

const features = [
  {
    icon: Bot,
    title: "Vigilante Chatbot",
    desc: "AI-powered analysis of social engineering tactics and phishing attempts.",
  },
  {
    icon: Eye,
    title: "Visual Guard",
    desc: "Scan images and QR codes for quishing threats and malicious payloads.",
  },
  {
    icon: Radar,
    title: "URL Radar",
    desc: "Detect typosquatting, domain impersonation and suspicious redirects.",
  },
  {
    icon: Key,
    title: "Identity Shield",
    desc: "Password entropy analysis with AI-generated secure mnemonics.",
  },
];

const stats = [
  { value: "99.7%", label: "Threat Detection" },
  { value: "< 50ms", label: "Scan Speed" },
  { value: "10M+", label: "Threats Blocked" },
  { value: "24/7", label: "Monitoring" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background cyber-grid overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center pt-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-mono text-primary mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse" />
              SYSTEM ACTIVE — ALL MODULES ONLINE
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              <span className="text-foreground">Multimodal</span>
              <br />
              <span className="text-gradient-cyber">Cyber Defense</span>
              <br />
              <span className="text-foreground">Platform</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
              AI-powered defense hub combining social engineering analysis, visual threat scanning, URL intelligence, and identity protection in one unified command center.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:glow-primary"
              >
                Access Command Center
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:text-primary"
              >
                Explore Modules
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative h-[400px] lg:h-[500px]"
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <Shield className="h-16 w-16 text-primary animate-pulse" />
                </div>
              }
            >
              <CyberGlobe />
            </Suspense>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <a href="#stats">
            <ChevronDown className="h-6 w-6 text-muted-foreground animate-bounce" />
          </a>
        </motion.div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-gradient-cyber">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-foreground">Defense Modules</h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Four integrated security tools working in concert to protect your digital identity.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 neon-border group hover:border-primary/40 transition-all"
              >
                <div className="inline-flex rounded-lg bg-primary/10 p-3 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Defend?</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Security-by-Design. Privacy-first. Built for the threats of tomorrow.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:glow-primary transition-all"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            CyberShield © 2026
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            SECURITY-BY-DESIGN • DATA PRIVACY COMPLIANT
          </div>
        </div>
      </footer>
    </div>
  );
}
