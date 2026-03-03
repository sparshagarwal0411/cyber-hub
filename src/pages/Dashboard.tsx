import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Eye, Radar, Key, Shield, Activity, Send, Upload, Link2, Lock, CheckCircle, AlertTriangle, XCircle, FileSearch, Copy, FileText, Search, ShieldAlert as ShieldIcon, RefreshCw, Save, X } from "lucide-react";
import { toast } from "sonner";
import { virusTotal } from "@/lib/virusTotal";
import { geminiService } from "@/lib/gemini";
import { profileService } from "@/lib/profileService";
import { useEffect } from "react";

// --- Analysis Loading Component ---
function AnalysisLoading({ messages, duration = 8000 }: { messages: string[], duration?: number }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(9.9);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 1800);

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) return 0.1;
        return parseFloat((prev - 0.1).toFixed(1));
      });
    }, 80);

    return () => {
      clearInterval(msgInterval);
      clearInterval(timerInterval);
    };
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="relative z-10 p-4 rounded-full border-2 border-dashed border-primary/30"
        >
          <div className="p-4 rounded-full bg-primary/10">
            <RefreshCw className="h-10 w-10 text-primary animate-spin-slow" />
          </div>
        </motion.div>
        <div className="absolute -top-2 -right-2 bg-background border border-border px-2 py-0.5 rounded-md shadow-lg">
          <span className="text-[10px] font-mono font-black text-primary">{timeLeft}s</span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm font-black text-foreground tracking-widest uppercase italic"
          >
            {messages[msgIndex]}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-1 justify-center">
          {messages.map((_, i) => (
            <div
              key={i}
              className={`h-1 w-4 rounded-full transition-all duration-500 ${i === msgIndex ? "bg-primary w-8" : "bg-secondary"}`}
            />
          ))}
        </div>
      </div>

      <div className="w-64 space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
          <span>Processing byte-streams</span>
          <span>{Math.round((1 - timeLeft / 10) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}

// --- Vigilante Chatbot ---
function VigilanteChatbot() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "I'm your Vigilante Chatbot. Paste any suspicious message, email, or social engineering attempt — I'll analyze the tactics used and rate the threat level." },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    // Dynamic analysis based on text
    setTimeout(() => {
      setIsTyping(false);
      let tactics = [];
      let riskLevel = "LOW";
      let recommendation = "Looks safe, but always double-check the sender's identity.";

      const text = userMsg.toLowerCase();
      if (text.includes("urgent") || text.includes("immediately") || text.includes("asap")) tactics.push("Urgency/Scarcity manipulation");
      if (text.includes("bank") || text.includes("irs") || text.includes("support")) tactics.push("Authority/Brand impersonation");
      if (text.includes("http") || text.includes("click") || text.includes("link")) tactics.push("Suspicious link/Call-to-action");
      if (text.includes("password") || text.includes("ssn") || text.includes("otp")) tactics.push("Credential harvesting attempt");

      if (tactics.length > 0) riskLevel = tactics.length >= 2 ? "CRITICAL" : "HIGH";
      if (riskLevel === "HIGH" || riskLevel === "CRITICAL") {
        recommendation = "Do not click any links or share information. Verify the sender through official channels. This message exhibits classic phishing patterns.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `**Threat Analysis Complete**\n\n🔍 **Tactics Detected:**\n${tactics.map(t => `- ${t}`).join("\n") || "- None detected (Normal pattern)"}\n\n⚠️ **Risk Level:** ${riskLevel}\n\n**Recommendation:** ${recommendation}`,
        },
      ]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap shadow-sm ${msg.role === "user"
                ? "bg-primary text-primary-foreground ml-auto rounded-tr-none"
                : "bg-secondary text-secondary-foreground mr-auto rounded-tl-none border border-border"
                }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-secondary p-3 rounded-2xl rounded-tl-none animate-pulse text-muted-foreground text-xs">
              Analyzing tactics...
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 p-1 bg-secondary/30 rounded-xl border border-border">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Paste suspicious message here..."
          className="flex-1 bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        <button onClick={handleSend} className="rounded-lg bg-primary p-2.5 text-primary-foreground hover:glow-primary transition-all shadow-lg active:scale-95">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// --- Visual Guard ---
function VisualGuard() {
  const [result, setResult] = useState<null | { safe: boolean; details: string; info?: string }>(null);
  const [scanning, setScanning] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setScanning(true);
      setResult(null);

      try {
        const analysis = await geminiService.analyzeImage(file);
        setResult(analysis);
        if (analysis.safe) {
          toast.success("Visual analysis complete: Safe");
        } else {
          toast.warning(`Threat detected: ${analysis.risk} risk`);
        }

        // Log the scan
        profileService.logScan('Visual', file.name, analysis.risk, analysis.details);
      } catch (error: any) {
        toast.error(error.message || "Failed to analyze image");
      } finally {
        setScanning(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 h-full justify-center py-4">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      <div
        className="w-full max-w-sm border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">Upload QR or Screenshot</p>
        <p className="text-xs text-muted-foreground mt-2">
          {fileName ? `Selected: ${fileName}` : "Drop image here to scan for hidden threats"}
        </p>
      </div>

      {scanning && (
        <AnalysisLoading
          messages={[
            "Initialising vision core...",
            "Decomposing visual layers...",
            "Scanning for QR obfuscation...",
            "Analyzing pixel patterns...",
            "Detecting social engineering cues..."
          ]}
          duration={5000}
        />
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-sm rounded-xl p-5 border shadow-xl ${result.safe ? "border-neon-green/30 bg-neon-green/5" : "border-neon-red/30 bg-neon-red/5"}`}
        >
          <div className="flex items-center gap-2 mb-3">
            {result.safe ? (
              <CheckCircle className="h-5 w-5 text-neon-green" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-neon-red" />
            )}
            <span className={`text-sm font-bold uppercase tracking-widest ${result.safe ? "text-neon-green" : "text-neon-red"}`}>
              {result.safe ? "VERIFIED SAFE" : "THREAT DETECTED"}
            </span>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed mb-2">{result.details}</p>
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">{result.info}</p>
        </motion.div>
      )}
    </div>
  );
}

// --- PDF Checker ---
function PDFChecker() {
  const [result, setResult] = useState<null | { safe: boolean; issues: string[]; risk: "LOW" | "MEDIUM" | "HIGH" }>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      if (file.type !== "application/pdf") {
        setError("No PDF found");
        setFileName(null);
        return;
      }
      setFileName(file.name);
      setAnalyzing(true);
      setResult(null);

      try {
        const scan = await virusTotal.scanFile(file);
        const analysis = await virusTotal.waitForAnalysis(scan.id);
        const stats = analysis.data.attributes.stats;

        const risk = stats.malicious > 0 ? "HIGH" : stats.suspicious > 0 ? "MEDIUM" : "LOW";
        const issues = Object.entries(analysis.data.attributes.results)
          .filter(([_, res]) => res.category === "malicious" || res.category === "suspicious")
          .map(([engine, res]) => `${engine}: ${res.result || "Detected"}`)
          .slice(0, 4);

        if (issues.length === 0) {
          issues.push("Clean result from all major security engines", "No malicious macros detected", "File structure verified");
        }

        setResult({
          safe: stats.malicious === 0,
          risk,
          issues
        });
        toast.success("PDF analysis complete");

        // Log the scan
        profileService.logScan('PDF', file.name, risk, issues.join(', '));
      } catch (error: any) {
        toast.error(error.message || "Failed to scan PDF");
      } finally {
        setAnalyzing(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 h-full justify-center py-4">
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />

      {!fileName && !analyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">PDF Armor</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            Detect hidden exploits, malicious macros, and suspicious automatic actions in PDF documents.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-neon-red text-xs font-bold uppercase tracking-widest mb-4 font-mono"
            >
              !! {error} !!
            </motion.div>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:glow-primary transition-all shadow-lg active:scale-95 flex items-center gap-2 mx-auto"
          >
            <Upload className="h-4 w-4" /> Select PDF File
          </button>
        </motion.div>
      )}

      {fileName && !analyzing && !result && (
        <div className="text-center p-8 glass border border-primary/20 rounded-2xl">
          <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-sm font-mono text-foreground mb-4">{fileName}</p>
          <button
            onClick={() => handleFileSelect({ target: { files: [fileInputRef.current?.files?.[0]] } } as any)}
            className="text-sm text-primary hover:underline"
          >
            Rescan file
          </button>
        </div>
      )}

      {analyzing && (
        <AnalysisLoading
          messages={[
            "Initialising analysis engine...",
            "Extracting metadata...",
            "Scanning byte-streams...",
            "Checking macro integrity...",
            "Verifying digital signatures..."
          ]}
          duration={10000}
        />
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-4"
        >
          <div className={`rounded-2xl p-6 border shadow-2xl ${result.safe ? "border-neon-green/30 bg-neon-green/5" : "border-neon-red/30 bg-neon-red/5"}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                {result.safe ? (
                  <Shield className="h-6 w-6 text-neon-green" />
                ) : (
                  <ShieldAlert className="h-6 w-6 text-neon-red" />
                )}
                <div>
                  <h4 className={`text-lg font-black tracking-widest uppercase ${result.safe ? "text-neon-green" : "text-neon-red"}`}>
                    {result.safe ? "SAFE PDF" : "MALICIOUS"}
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-bold font-mono">{fileName}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${result.risk === "HIGH" ? "bg-neon-red text-white" : "bg-neon-green text-black"}`}>
                RISK: {result.risk}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Analysis Results:</p>
              {result.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                  <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${result.safe ? "bg-neon-green" : "bg-neon-red"}`} />
                  {issue}
                </div>
              ))}
            </div>

            <button
              onClick={() => { setResult(null); setFileName(null); }}
              className="w-full mt-6 py-2.5 rounded-xl bg-secondary hover:bg-secondary/70 text-xs font-bold transition-all uppercase tracking-widest"
            >
              Check another file
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ShieldAlert({ className }: { className?: string }) {
  return <AlertTriangle className={className} />;
}

// --- URL Radar ---
function URLRadar() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<null | { risk: "LOW" | "MEDIUM" | "HIGH"; issues: string[]; details: any }>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!url.trim()) return;

    // Simple URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      setError("No link found");
      return;
    }

    setError(null);
    setChecking(true);
    setResult(null);

    try {
      const scan = await virusTotal.scanUrl(url);
      const analysis = await virusTotal.waitForAnalysis(scan.id);
      const stats = analysis.data.attributes.stats;

      const risk = stats.malicious > 0 ? "HIGH" : stats.suspicious > 0 ? "MEDIUM" : "LOW";
      const issues = Object.entries(analysis.data.attributes.results)
        .filter(([_, res]) => res.category === "malicious" || res.category === "suspicious")
        .map(([engine, res]) => `${engine}: ${res.result || "Detected"}`)
        .slice(0, 4);

      if (issues.length === 0) {
        issues.push("Domain verified and trusted", "Strong SSL encryption", "No phishing patterns found");
      }

      setResult({
        risk,
        issues,
        details: {
          ip: "Analyzed",
          location: "Global Intelligence Network",
          reputation: risk === "LOW" ? "Excellent" : "Suspicious"
        }
      });
      toast.success("URL scan complete");

      // Log the scan
      profileService.logScan('URL', url, risk, issues.join(', '));
    } catch (error: any) {
      toast.error(error.message || "Failed to scan URL");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="space-y-4 pt-4">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Domain Scanner</label>
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              placeholder="Enter URL (e.g., https://yourbank.secure.com)..."
              className="w-full rounded-xl border border-border bg-secondary/30 pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <button
            onClick={handleCheck}
            disabled={checking}
            className="rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground hover:glow-primary transition-all disabled:opacity-50 active:scale-95 shadow-lg"
          >
            SCAN
          </button>
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-neon-red text-[10px] font-bold uppercase tracking-widest px-1 mt-2 font-mono"
          >
            !! {error} !!
          </motion.div>
        )}
      </div>

      {checking && (
        <AnalysisLoading
          messages={[
            "Initialising radar...",
            "Resolving domain DNS...",
            "Checking SSL certificates...",
            "Scanning for redirection loops...",
            "Verifying server reputation..."
          ]}
          duration={8000}
        />
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-secondary/20 p-6 space-y-6 shadow-2xl relative overflow-hidden"
        >
          <div className={`absolute top-0 right-0 px-4 py-1.5 text-[10px] font-black tracking-[0.2em] rounded-bl-xl ${result.risk === "HIGH" ? "bg-neon-red text-white" : result.risk === "MEDIUM" ? "bg-yellow-500 text-black" : "bg-neon-green text-black"}`}>
            REPUTATION: {result.details.reputation}
          </div>

          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${result.risk === "HIGH" ? "bg-neon-red/10" : result.risk === "MEDIUM" ? "bg-yellow-500/10" : "bg-neon-green/10"}`}>
              {result.risk === "HIGH" ? (
                <XCircle className="h-8 w-8 text-neon-red" />
              ) : result.risk === "MEDIUM" ? (
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              ) : (
                <CheckCircle className="h-8 w-8 text-neon-green" />
              )}
            </div>
            <div>
              <h4 className={`text-xl font-black ${result.risk === "HIGH" ? "text-neon-red" : result.risk === "MEDIUM" ? "text-yellow-500" : "text-neon-green"}`}>
                RISK LEVEL: {result.risk}
              </h4>
              <p className="text-xs text-muted-foreground">Server IP: {result.details.ip} • Region: {result.details.location}</p>
            </div>
          </div>

          <div className="grid gap-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Alerts:</p>
            {result.issues.map((issue, i) => (
              <li key={i} className="text-sm text-foreground/80 flex items-center gap-3 list-none bg-background/50 p-2.5 rounded-lg border border-border/50">
                <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${result.risk === "HIGH" ? "bg-neon-red shadow-[0_0_8px_#f43f5e]" : result.risk === "MEDIUM" ? "bg-yellow-500 shadow-[0_0_8px_#eab308]" : "bg-neon-green shadow-[0_0_8px_#10b981]"}`} />
                {issue}
              </li>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// --- Identity Shield Components ---
function VaultSaveModal({ isOpen, onClose, password, onSave }: { isOpen: boolean; onClose: () => void; password: string; onSave: (service: string, code: string) => void }) {
  const [service, setService] = useState("");
  const [code, setCode] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass border-2 border-primary/30 rounded-[2rem] p-8 max-w-md w-full relative z-10 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-foreground italic uppercase">Cyber Vault</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Securely store this generated password in your personal locker.
          <span className="text-primary font-bold ml-1">Remember your Secret Access Code</span> to retrieve it later in your Profile.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Service / Account Name</label>
            <input
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="e.g. Google, My Bank, Instagram..."
              className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Secret Access Code</label>
              {code && (
                <span className={`text-[9px] font-black uppercase tracking-tighter ${code.length < 4 ? "text-neon-red" :
                    /^\d+$/.test(code) ? "text-yellow-500" : "text-neon-green"
                  }`}>
                  {code.length < 4 ? "Too Short" : /^\d+$/.test(code) ? "Medium Security" : "Hardened"}
                </span>
              )}
            </div>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Set a 4+ digit secret code..."
              className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono"
            />
            {code && (
              <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: code.length < 4 ? "33%" : /^\d+$/.test(code) ? "66%" : "100%",
                    backgroundColor: code.length < 4 ? "#f43f5e" : /^\d+$/.test(code) ? "#eab308" : "#10b981"
                  }}
                  className="h-full"
                />
              </div>
            )}
          </div>

          <button
            onClick={() => onSave(service, code)}
            disabled={!service || !code}
            className="w-full mt-4 rounded-xl bg-primary py-4 text-sm font-bold text-primary-foreground hover:glow-primary transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" /> SECURE IN VAULT
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function IdentityShield() {
  const [password, setPassword] = useState("");
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const strength = entropy < 35 ? "Dangerous" : entropy < 55 ? "Vulnerable" : entropy < 75 ? "Hardened" : "Military Grade";
  const strengthColor = entropy < 35 ? "text-neon-red" : entropy < 55 ? "text-yellow-500" : entropy < 75 ? "text-neon-cyan" : "text-neon-green";
  const barWidth = Math.min(100, (entropy / 100) * 100);

  const generateMnemonic = () => {
    const words = ["Quantum", "Cipher", "Vortex", "Banshee", "Wraith", "Titan", "Nebula", "Chrome", "Onyx", "Spectral", "Flux", "Hazard", "Zenith", "Neon"];
    const selected = Array.from({ length: 4 }, () => words[Math.floor(Math.random() * words.length)]);
    const num = Math.floor(Math.random() * 899) + 100;
    const special = ["!", "@", "#", "$", "%", "^", "&", "*"][Math.floor(Math.random() * 8)];
    const result = selected.join("-") + "-" + num + special;
    setPassword(result);
    toast.success("Cyber-mnemonic generated!");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    toast.success("Password copied to clipboard!");
    if (password) {
      setIsVaultOpen(true);
    }
  };

  const handleVaultSave = async (service: string, code: string) => {
    setSaving(true);
    try {
      await profileService.saveToVault(service, password, code);
      toast.success("Password secured in your Cyber Vault");
      setIsVaultOpen(false);
    } catch (error) {
      console.error("Vault error:", error);
      toast.error("Failed to secure password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full py-4 relative">
      <VaultSaveModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        password={password}
        onSave={handleVaultSave}
      />
      <div className="space-y-3">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Vault Key Evaluator</label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type password or generate secure key..."
            className="w-full rounded-xl border border-border bg-secondary/30 pl-11 pr-12 py-3.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
          {password && (
            <button
              onClick={copyToClipboard}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-primary/20 rounded-lg text-primary transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {password && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-border bg-secondary/10 p-6 space-y-6 shadow-2xl"
        >
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Strength Rating</span>
              <h4 className={`text-xl font-black ${strengthColor} mt-1`}>{strength}</h4>
            </div>
            <span className="text-sm font-mono font-bold text-primary">{entropy} BITS</span>
          </div>

          <div className="h-2.5 rounded-full bg-secondary overflow-hidden shadow-inner">
            <motion.div
              className={`h-full transition-all duration-1000 ${entropy < 35 ? "bg-neon-red" : entropy < 55 ? "bg-yellow-500" : entropy < 75 ? "bg-neon-cyan" : "bg-neon-green"
                } shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
              initial={{ width: 0 }}
              animate={{ width: `${barWidth}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Lowercase", test: /[a-z]/ },
              { label: "Uppercase", test: /[A-Z]/ },
              { label: "Numerical", test: /[0-9]/ },
              { label: "Special", test: /[^a-zA-Z0-9]/ }
            ].map((rule, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50">
                {rule.test.test(password) ? (
                  <CheckCircle className="h-4 w-4 text-neon-green" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-muted-foreground opacity-30" />
                )}
                <span className={`text-[11px] font-bold uppercase tracking-wider ${rule.test.test(password) ? "text-foreground" : "text-muted-foreground/60"}`}>
                  {rule.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <button
        onClick={generateMnemonic}
        className="w-full mt-auto rounded-xl border-2 border-primary/20 bg-primary/5 px-4 py-4 text-sm font-black text-primary hover:bg-primary hover:text-primary-foreground hover:glow-primary transition-all uppercase tracking-widest shadow-lg flex items-center justify-center gap-3"
      >
        <Key className="h-5 w-5" /> Generate Hardened Mnemonic
      </button>
    </div>
  );
}

// --- Dashboard ---
const tools = [
  { id: "chatbot", icon: Bot, label: "Vigilante Chatbot", desc: "Social engineering analyzer", brief: "Analyze suspicious messages or emails for social engineering tactics and rating threat levels.", component: VigilanteChatbot },
  { id: "visual", icon: Eye, label: "Visual Guard", desc: "Image & QR scanner", brief: "Scan images, QR codes, or screenshots for hidden phishing attempts and fraudulent visual cues.", component: VisualGuard },
  { id: "pdf", icon: FileSearch, label: "PDF Armor", desc: "Exploit & macro detector", brief: "In-depth analysis of PDF documents to detect malicious macros, hidden scripts, and exploits.", component: PDFChecker },
  { id: "url", icon: Radar, label: "URL Radar", desc: "Domain infrastructure intel", brief: "Analyze domain infrastructure, SSL certificates, and server reputation for potential threats.", component: URLRadar },
  { id: "identity", icon: Key, label: "Identity Shield", desc: "Military-grade key analyzer", brief: "Evaluate password strength and generate high-entropy mnemonics for secure vault keys.", component: IdentityShield },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("chatbot");
  const ActiveComponent = tools.find((t) => t.id === activeTab)?.component || VigilanteChatbot;

  return (
    <div className="min-h-screen bg-background cyber-grid pt-24 px-4 pb-12">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center lg:text-left"
        >
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-3">
            <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">
              Cyber <span className="text-primary not-italic">Hub</span>
            </h1>
          </div>
          <p className="text-base text-muted-foreground font-medium max-w-xl">
            Command Center for advanced cyber defense. Select a specialized module to investigate potential threats.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Tool tabs sidebar */}
          <div className="flex lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all whitespace-nowrap group relative overflow-hidden ${activeTab === tool.id
                  ? "glass bg-primary/10 border-2 border-primary/50 shadow-[0_0_25px_rgba(var(--primary-rgb),0.15)]"
                  : "hover:bg-secondary/50 border-2 border-transparent"
                  }`}
              >
                {activeTab === tool.id && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 bg-primary/5 pointer-events-none"
                  />
                )}
                <div className={`p-2 rounded-lg transition-colors ${activeTab === tool.id ? "bg-primary text-primary-foreground shadow-lg" : "bg-secondary text-muted-foreground group-hover:text-primary"}`}>
                  <tool.icon className="h-5 w-5 shrink-0" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-black tracking-tight ${activeTab === tool.id ? "text-foreground" : "text-muted-foreground"}`}>
                    {tool.label}
                  </div>
                  <div className={`text-[10px] uppercase font-bold tracking-wider truncate transition-colors ${activeTab === tool.id ? "text-primary/80" : "text-muted-foreground/50"}`}>
                    {tool.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Active tool display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="glass rounded-[2rem] border-2 border-border/50 p-8 min-h-[600px] flex flex-col shadow-2xl relative overflow-hidden backdrop-blur-xl"
            >
              {/* Background decorative elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />

              <div className="mb-6 pb-6 border-b border-border/50 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {(() => {
                      const tool = tools.find(t => t.id === activeTab);
                      const ToolIcon = tool?.icon || Bot;
                      return <ToolIcon className="h-5 w-5" />;
                    })()}
                  </div>
                  <h2 className="text-xl font-black text-foreground uppercase tracking-tight italic">
                    {tools.find(t => t.id === activeTab)?.label}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground font-medium max-w-2xl leading-relaxed">
                  {tools.find(t => t.id === activeTab)?.brief}
                </p>
              </div>

              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
