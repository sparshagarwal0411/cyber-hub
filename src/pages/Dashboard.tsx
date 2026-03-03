import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Eye, Radar, Key, Shield, Activity, Send, Upload, Link2, Lock, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { toast } from "sonner";

// --- Vigilante Chatbot ---
function VigilanteChatbot() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "I'm your Vigilante Chatbot. Paste any suspicious message, email, or social engineering attempt — I'll analyze the tactics used and rate the threat level." },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");

    // Simulated analysis
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `**Threat Analysis Complete**\n\n🔍 **Tactics Detected:**\n- Urgency manipulation\n- Authority impersonation\n- Suspicious link pattern\n\n⚠️ **Risk Level:** HIGH\n\n**Recommendation:** Do not click any links. Verify the sender through official channels. This message exhibits classic phishing patterns.`,
        },
      ]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Paste suspicious message..."
          className="flex-1 rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        />
        <button onClick={handleSend} className="rounded-lg bg-primary p-2.5 text-primary-foreground hover:glow-primary transition-all">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// --- Visual Guard ---
function VisualGuard() {
  const [result, setResult] = useState<null | { safe: boolean; details: string }>(null);
  const [scanning, setScanning] = useState(false);

  const handleUpload = () => {
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      setResult({
        safe: Math.random() > 0.4,
        details: Math.random() > 0.4
          ? "No malicious payloads detected. QR code points to a verified domain."
          : "⚠️ QUISHING ALERT: QR code redirects to a credential harvesting page mimicking a banking login.",
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6 h-full justify-center">
      <div className="w-full max-w-sm border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
           onClick={handleUpload}>
        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Drop image or QR code here to scan</p>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG supported</p>
      </div>
      {scanning && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Activity className="h-4 w-4 animate-pulse" /> Scanning for threats...
        </div>
      )}
      {result && (
        <div className={`w-full max-w-sm rounded-xl p-4 neon-border ${result.safe ? "border-neon-green/30" : "border-neon-red/30"}`}>
          <div className="flex items-center gap-2 mb-2">
            {result.safe ? (
              <CheckCircle className="h-5 w-5 text-neon-green" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-neon-red" />
            )}
            <span className={`text-sm font-semibold ${result.safe ? "text-neon-green" : "text-neon-red"}`}>
              {result.safe ? "SAFE" : "THREAT DETECTED"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{result.details}</p>
        </div>
      )}
    </div>
  );
}

// --- URL Radar ---
function URLRadar() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<null | { risk: string; issues: string[] }>(null);
  const [checking, setChecking] = useState(false);

  const handleCheck = () => {
    if (!url.trim()) return;
    setChecking(true);
    setResult(null);
    setTimeout(() => {
      setChecking(false);
      const isSuspicious = url.includes("0") || url.includes("1") || url.length > 30;
      setResult({
        risk: isSuspicious ? "HIGH" : "LOW",
        issues: isSuspicious
          ? ["Possible typosquatting detected", "Domain registered < 30 days ago", "SSL certificate mismatch", "Known phishing pattern match"]
          : ["Domain verified and trusted", "SSL certificate valid", "No typosquatting patterns found"],
      });
    }, 1800);
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="Enter URL to analyze..."
            className="w-full rounded-lg border border-border bg-secondary/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        <button onClick={handleCheck} disabled={checking} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:glow-primary transition-all disabled:opacity-50">
          Scan
        </button>
      </div>
      {checking && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Radar className="h-4 w-4 animate-spin" /> Analyzing domain...
        </div>
      )}
      {result && (
        <div className="rounded-xl neon-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            {result.risk === "HIGH" ? (
              <XCircle className="h-5 w-5 text-neon-red" />
            ) : (
              <CheckCircle className="h-5 w-5 text-neon-green" />
            )}
            <span className={`text-sm font-bold ${result.risk === "HIGH" ? "text-neon-red" : "text-neon-green"}`}>
              Risk: {result.risk}
            </span>
          </div>
          <ul className="space-y-1.5">
            {result.issues.map((issue, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- Identity Shield ---
function IdentityShield() {
  const [password, setPassword] = useState("");

  const entropy = password.length > 0
    ? (() => {
        let charset = 0;
        if (/[a-z]/.test(password)) charset += 26;
        if (/[A-Z]/.test(password)) charset += 26;
        if (/[0-9]/.test(password)) charset += 10;
        if (/[^a-zA-Z0-9]/.test(password)) charset += 32;
        return Math.round(password.length * Math.log2(charset || 1));
      })()
    : 0;

  const strength = entropy < 28 ? "Weak" : entropy < 50 ? "Fair" : entropy < 70 ? "Strong" : "Excellent";
  const strengthColor = entropy < 28 ? "text-neon-red" : entropy < 50 ? "text-yellow-500" : entropy < 70 ? "text-neon-cyan" : "text-neon-green";
  const barWidth = Math.min(100, (entropy / 80) * 100);

  const generateMnemonic = () => {
    const words = ["Tiger", "Crystal", "Nebula", "Quantum", "Falcon", "Cipher", "Vortex", "Phoenix", "Arctic", "Prism"];
    const selected = Array.from({ length: 4 }, () => words[Math.floor(Math.random() * words.length)]);
    const num = Math.floor(Math.random() * 99) + 1;
    const special = ["!", "@", "#", "$"][Math.floor(Math.random() * 4)];
    const result = selected.join("-") + num + special;
    setPassword(result);
    toast.success("Secure mnemonic password generated!");
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
          Password to Analyze
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter or generate a password..."
            className="w-full rounded-lg border border-border bg-secondary/50 pl-10 pr-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>

      {password && (
        <div className="rounded-xl neon-border p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Entropy</span>
            <span className={`text-sm font-bold ${strengthColor}`}>{strength} ({entropy} bits)</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              {/[a-z]/.test(password) ? <CheckCircle className="h-3.5 w-3.5 text-neon-green" /> : <XCircle className="h-3.5 w-3.5 text-neon-red" />}
              <span className="text-muted-foreground">Lowercase</span>
            </div>
            <div className="flex items-center gap-2">
              {/[A-Z]/.test(password) ? <CheckCircle className="h-3.5 w-3.5 text-neon-green" /> : <XCircle className="h-3.5 w-3.5 text-neon-red" />}
              <span className="text-muted-foreground">Uppercase</span>
            </div>
            <div className="flex items-center gap-2">
              {/[0-9]/.test(password) ? <CheckCircle className="h-3.5 w-3.5 text-neon-green" /> : <XCircle className="h-3.5 w-3.5 text-neon-red" />}
              <span className="text-muted-foreground">Numbers</span>
            </div>
            <div className="flex items-center gap-2">
              {/[^a-zA-Z0-9]/.test(password) ? <CheckCircle className="h-3.5 w-3.5 text-neon-green" /> : <XCircle className="h-3.5 w-3.5 text-neon-red" />}
              <span className="text-muted-foreground">Special</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={generateMnemonic}
        className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-all"
      >
        🔑 Generate Secure Mnemonic
      </button>
    </div>
  );
}

// --- Dashboard ---
const tools = [
  { id: "chatbot", icon: Bot, label: "Vigilante Chatbot", desc: "Social engineering analyzer", component: VigilanteChatbot },
  { id: "visual", icon: Eye, label: "Visual Guard", desc: "Image & QR scanner", component: VisualGuard },
  { id: "url", icon: Radar, label: "URL Radar", desc: "Domain intelligence", component: URLRadar },
  { id: "identity", icon: Key, label: "Identity Shield", desc: "Password analyzer", component: IdentityShield },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("chatbot");
  const ActiveComponent = tools.find((t) => t.id === activeTab)?.component || VigilanteChatbot;

  return (
    <div className="min-h-screen bg-background cyber-grid pt-20 px-4 pb-8">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
          </div>
          <p className="text-sm text-muted-foreground">Select a defense module to begin your analysis.</p>
        </motion.div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Tool tabs */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all whitespace-nowrap ${
                  activeTab === tool.id
                    ? "glass neon-border bg-primary/5"
                    : "hover:bg-secondary/50"
                }`}
              >
                <tool.icon className={`h-5 w-5 shrink-0 ${activeTab === tool.id ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <div className={`text-sm font-medium ${activeTab === tool.id ? "text-foreground" : "text-muted-foreground"}`}>
                    {tool.label}
                  </div>
                  <div className="text-xs text-muted-foreground hidden lg:block">{tool.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Active tool */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl neon-border p-6 min-h-[500px]"
          >
            <ActiveComponent />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
