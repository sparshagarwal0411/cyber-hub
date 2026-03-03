import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Activity, Globe, Ban, AlertTriangle, TrendingUp, Users, Server } from "lucide-react";
import { toast } from "sonner";

const mockThreats = [
  { id: 1, type: "Phishing", source: "user_report", domain: "g00gle-login.com", severity: "Critical", time: "2 min ago" },
  { id: 2, type: "Quishing", source: "visual_guard", domain: "qr-payment.xyz", severity: "High", time: "15 min ago" },
  { id: 3, type: "Typosquatting", source: "url_radar", domain: "amaz0n-deals.net", severity: "High", time: "1 hr ago" },
  { id: 4, type: "Social Engineering", source: "chatbot", domain: "support-microsoft.co", severity: "Medium", time: "2 hr ago" },
  { id: 5, type: "Credential Harvest", source: "user_report", domain: "bank0famerica-login.com", severity: "Critical", time: "3 hr ago" },
];

const stats = [
  { label: "Active Threats", value: "23", icon: AlertTriangle, trend: "+5" },
  { label: "Domains Blacklisted", value: "1,847", icon: Ban, trend: "+12" },
  { label: "Users Protected", value: "45.2K", icon: Users, trend: "+340" },
  { label: "System Uptime", value: "99.97%", icon: Server, trend: "0.0%" },
];

export default function Admin() {
  const [threats, setThreats] = useState(mockThreats);

  const handleBlacklist = (domain: string, id: number) => {
    setThreats((prev) => prev.filter((t) => t.id !== id));
    toast.success(`Domain blacklisted: ${domain}`);
  };

  return (
    <div className="min-h-screen bg-background cyber-grid pt-20 px-4 pb-8">
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Admin Operations Center</h1>
          </div>
          <p className="text-sm text-muted-foreground">Role-based access • Live threat monitoring • Action center</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl neon-border p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-mono text-neon-green">↑ {stat.trend}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Threat Feed */}
        <div className="glass rounded-2xl neon-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
            <h2 className="text-lg font-semibold text-foreground">Live Threat Feed</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">Domain</th>
                  <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">Severity</th>
                  <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">Source</th>
                  <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">Time</th>
                  <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {threats.map((threat) => (
                  <motion.tr
                    key={threat.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3 px-2 font-medium text-foreground">{threat.type}</td>
                    <td className="py-3 px-2 font-mono text-xs text-neon-red">{threat.domain}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        threat.severity === "Critical"
                          ? "bg-neon-red/10 text-neon-red"
                          : threat.severity === "High"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {threat.severity}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">{threat.source}</td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">{threat.time}</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleBlacklist(threat.domain, threat.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neon-red/30 bg-neon-red/5 px-3 py-1.5 text-xs font-medium text-neon-red hover:bg-neon-red/10 transition-all"
                      >
                        <Ban className="h-3 w-3" />
                        Blacklist
                      </button>
                    </td>
                  </motion.tr>
                ))}
                {threats.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      All threats have been handled. System secure. ✓
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
